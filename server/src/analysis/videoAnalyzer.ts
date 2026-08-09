import { GoogleGenAI, createPartFromUri, createUserContent } from "@google/genai";
import { stat } from "fs/promises";
import path from "path";

const SYSTEM_PROMPT = `You are an elite CDL-style coach analyzing Ranked POV VODs.

Your tone must feel like a real pro coach:
- direct, specific, no generic filler
- explain why a mistake loses rounds in higher lobbies
- name patterns (overheat after blood, lost trade window, untradeable wide peek, late rotate setup)

POV ownership rules:
- The uploader/player POV is the ONLY gameplay that should be graded.
- Detect non-playable states such as KILLCAM, deathcam, best play, final kill, spectating teammates, respawn flyovers, or any enemy POV takeover.
- When the screen says "KILLCAM" or shows the enemy/attacker perspective, do NOT evaluate that shown player's aim, movement, mechanics, or decision-making as if it belongs to the uploader.
- Killcam footage may be used only as supporting evidence to explain what mistake the uploader made immediately before dying (for example: overexposed angle, no cover, predictable re-peek, bad route, late trade, poor awareness).
- If a sequence is not clearly the uploader's controllable POV, either omit it or keep confidence low and describe only the uploader's mistake that the sequence reveals.
- Never give the uploader positive or negative mechanical credit for actions performed by the enemy inside killcam/spectator footage.

When uncertain, lower confidence instead of inventing.
Prefer concrete timestamped evidence.

Return ONLY a JSON object with this exact shape:
{
  "gameMode": "string or null",
  "mapName": "string or null",
  "observations": ["general observations"],
  "keyMoments": [
    {
      "timestamp": "M:SS",
      "event": "short event title",
      "eventKey": "initial_setup_hold|aggressive_initial_push|good_info_peek|preaim_angle_discipline|first_blood_secured|clean_opening_pick|overheat_after_blood|overexposed_post_kill|untradeable_death|lack_of_cover_discipline|tunnel_vision|killcam_exposed_confirmation|isolated_engagement|wide_exposure|generic_positive|generic_negative",
      "category": "aim|movement|positioning|decision|awareness|mechanical|teamplay|objective",
      "rating": "excellent|good|neutral|bad|terrible",
      "analysis": "what happened and why it matters",
      "recommendation": "what to do instead or keep doing",
      "confidence": "high|medium|low",
      "perspective": "player_pov|killcam_inference|non_playable_state"
    }
  ],
  "aimNotes": ["..."],
  "movementNotes": ["..."],
  "positioningNotes": ["..."],
  "decisionNotes": ["..."]
}

Hard limits:
- keyMoments: 6 to 20 items
- observations: max 8 items
- each notes array: max 8 items
- keep each string concise (about 1 sentence)
- confidence should reflect evidence quality (high/medium/low)
- use perspective="player_pov" for controllable live gameplay
- use perspective="killcam_inference" only when killcam/deathcam shows evidence about the uploader's mistake
- use perspective="non_playable_state" for scoreboard/menu/respawn/spectating states that should not be graded
- use the canonical eventKey list exactly; do not invent new event keys
- if the game mode or map is not explicitly visible from HUD/context, return null instead of guessing
- prefer fewer, higher-confidence moments over many speculative ones

CDL lens reminders:
- S&D: first blood conversion and trade windows are high priority
- Hardpoint: setup timing, cover discipline, and survivability after contact are high priority
- Penalize ego re-challs and open-lane exposure in high-ranked punish terms

Do not use markdown fences. Output must be valid JSON.`;

let client: GoogleGenAI | null = null;
const FILE_POLL_INTERVAL_MS = 2000;
const FILE_PROCESS_TIMEOUT_MS = 4 * 60 * 1000;
const MAX_ANALYZABLE_VIDEO_BYTES = 512 * 1024 * 1024; // 512MB

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
  }
  return client;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
  };
  return mimeTypes[ext] || "video/mp4";
}

function stripCodeFence(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function extractBalancedJsonObject(input: string): string | null {
  const start = input.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastCompleteEnd = -1;

  for (let i = start; i < input.length; i += 1) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      depth += 1;
      continue;
    }

    if (ch === "}") {
      depth -= 1;
      if (depth === 0) lastCompleteEnd = i;
      if (depth < 0) break;
    }
  }

  if (lastCompleteEnd === -1) return null;
  return input.slice(start, lastCompleteEnd + 1).trim();
}

function tryParseObject(input: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(input) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Continue to next candidate.
  }
  return null;
}

function parseModelPayload(rawText: string): Record<string, unknown> | null {
  const stripped = stripCodeFence(rawText);
  const candidates = [
    rawText.trim(),
    stripped,
    extractBalancedJsonObject(rawText) || "",
    extractBalancedJsonObject(stripped) || "",
  ];

  const seen = new Set<string>();
  for (const candidate of candidates) {
    const normalized = candidate.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);

    const parsed = tryParseObject(normalized);
    if (parsed) return parsed;
  }

  return null;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function asStringArray(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return [];
  const output: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const cleaned = item.trim();
    if (!cleaned) continue;
    output.push(cleaned);
    if (output.length >= max) break;
  }
  return output;
}

const KILLCAM_MARKERS = [
  "killcam",
  "deathcam",
  "attacker",
  "attacker's pov",
  "enemy pov",
  "enemy perspective",
  "spectating",
  "spectator",
  "best play",
  "final kill",
  "respawn camera",
];

const PLAYER_MISTAKE_MARKERS = [
  "exposed",
  "cover",
  "peek",
  "re-peek",
  "rechall",
  "re-chall",
  "challenge",
  "chall",
  "position",
  "positioning",
  "route",
  "awareness",
  "caught",
  "visible",
  "isolated",
  "untradeable",
  "timing",
  "reload",
  "late",
  "swing",
  "overheat",
  "trade",
  "ego",
];

const STABLE_EVENT_KEYS = new Set([
  "initial_setup_hold",
  "aggressive_initial_push",
  "good_info_peek",
  "preaim_angle_discipline",
  "first_blood_secured",
  "clean_opening_pick",
  "overheat_after_blood",
  "overexposed_post_kill",
  "untradeable_death",
  "lack_of_cover_discipline",
  "tunnel_vision",
  "killcam_exposed_confirmation",
  "isolated_engagement",
  "wide_exposure",
  "generic_positive",
  "generic_negative",
]);

const EVENT_KEY_LABELS: Record<string, string> = {
  initial_setup_hold: "Initial Setup & Lane Hold",
  aggressive_initial_push: "Aggressive Initial Push",
  good_info_peek: "Passive Peek for Info",
  preaim_angle_discipline: "Pre-aim & Angle Discipline",
  first_blood_secured: "First Blood Secured",
  clean_opening_pick: "Clean Opening Pick",
  overheat_after_blood: "Overheat After Blood",
  overexposed_post_kill: "Overexposed Post-Kill",
  untradeable_death: "Untradeable Death",
  lack_of_cover_discipline: "Lack of Cover Discipline",
  tunnel_vision: "Tunnel Vision After Contact",
  killcam_exposed_confirmation: "Killcam Inference: Exposed Position",
  isolated_engagement: "Isolated Engagement",
  wide_exposure: "Wide Exposure",
  generic_positive: "Positive Sequence",
  generic_negative: "Punishable Sequence",
};

const EVENT_KEY_RECOMMENDATIONS: Record<string, string> = {
  initial_setup_hold: "Continue to prioritize strong initial setups that offer cover and clear lines of sight.",
  aggressive_initial_push: "If you take an aggressive opener, make sure you have immediate cover or a planned escape route.",
  good_info_peek: "Keep using low-commitment info peeks before fully exposing for a chall.",
  preaim_angle_discipline: "Maintain this level of pre-aim and continue clearing angles methodically.",
  first_blood_secured: "After a first blood, convert it by breaking line of sight, repositioning, and forcing the enemy trade to be difficult.",
  clean_opening_pick: "After a clean opening kill, reset to cover before taking the next angle.",
  overheat_after_blood: "After a kill, immediately break line of sight, reposition, or re-evaluate the next threat lane.",
  overexposed_post_kill: "After winning a fight, move to hard cover before you search for the next engagement.",
  untradeable_death: "Play closer to cover or teammate trade paths so a follow-up death is harder to punish.",
  lack_of_cover_discipline: "Anchor your gunfights to hard cover you can instantly fall back behind.",
  tunnel_vision: "Build a post-kill scan habit so you clear the next likely threat angle before re-committing.",
  killcam_exposed_confirmation: "Use the death review to identify exactly which angle left you exposed and adjust your next hold.",
  isolated_engagement: "Avoid isolated fights when there is no teammate pressure or trade path supporting the chall.",
  wide_exposure: "Slice one angle at a time instead of exposing yourself to multiple threat lines.",
  generic_positive: "Repeat the same disciplined setup and only scale the advantage once you are safe.",
  generic_negative: "Lower the risk of this sequence by using stronger cover and cleaner post-contact discipline.",
};

function isKillcamText(text: string): boolean {
  const lower = text.toLowerCase();
  return KILLCAM_MARKERS.some((marker) => lower.includes(marker));
}

function referencesPlayerMistake(text: string): boolean {
  const lower = text.toLowerCase();
  return PLAYER_MISTAKE_MARKERS.some((marker) => lower.includes(marker));
}

function normalizeKillcamMomentCategory(
  category: string,
  combinedText: string
): VideoAnalysisResult["keyMoments"][number]["category"] {
  const lowerCategory = category.toLowerCase();
  if (!isKillcamText(combinedText)) {
    return lowerCategory;
  }

  if (combinedText.includes("position") || combinedText.includes("cover") || combinedText.includes("angle")) {
    return "positioning";
  }
  if (combinedText.includes("awareness") || combinedText.includes("trade") || combinedText.includes("visible")) {
    return "awareness";
  }
  return "decision";
}

function normalizePerspective(
  value: unknown,
  combinedText: string
): VideoAnalysisResult["keyMoments"][number]["perspective"] {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === "player_pov" ||
      normalized === "killcam_inference" ||
      normalized === "non_playable_state"
    ) {
      return normalized;
    }
  }

  if (isKillcamText(combinedText)) return "killcam_inference";
  return "player_pov";
}

function normalizeGameMode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return null;

  if (cleaned === "hardpoint") return "Hardpoint";
  if (cleaned === "search & destroy" || cleaned === "search and destroy" || cleaned === "snd") {
    return "Search & Destroy";
  }
  if (cleaned === "control") return "Control";
  return null;
}

function inferEventKey(event: string, category: string, analysis: string, recommendation: string, perspective: string): string {
  const text = `${event} ${analysis} ${recommendation}`.toLowerCase();

  if (perspective === "killcam_inference") return "killcam_exposed_confirmation";
  if (text.includes("first blood")) return "first_blood_secured";
  if (text.includes("initial") && (text.includes("hold") || text.includes("setup") || text.includes("lane"))) {
    return "initial_setup_hold";
  }
  if (text.includes("pre-aim") || text.includes("preaim") || text.includes("crosshair placement") || text.includes("angle discipline")) {
    return "preaim_angle_discipline";
  }
  if (text.includes("info peek") || text.includes("passive peek")) return "good_info_peek";
  if (text.includes("aggressive") && text.includes("push")) return "aggressive_initial_push";
  if (text.includes("overheat") || (text.includes("post-kill") && text.includes("exposed"))) return "overheat_after_blood";
  if (text.includes("untradeable")) return "untradeable_death";
  if (text.includes("tunnel vision")) return "tunnel_vision";
  if (text.includes("cover discipline") || (text.includes("no cover") || text.includes("without cover"))) {
    return "lack_of_cover_discipline";
  }
  if (text.includes("wide") && text.includes("expos")) return "wide_exposure";
  if (text.includes("isolated")) return "isolated_engagement";
  if (text.includes("opening pick")) return "clean_opening_pick";
  if (text.includes("exposed") && text.includes("post-kill")) return "overexposed_post_kill";

  if (category === "aim" && (text.includes("pick") || text.includes("kill"))) return "clean_opening_pick";
  if (category === "positioning" && (text.includes("exposed") || text.includes("cover"))) return "overexposed_post_kill";
  if (category === "awareness") return "tunnel_vision";
  if (category === "teamplay") return "untradeable_death";
  return text.includes("good") || text.includes("strong") || text.includes("clean")
    ? "generic_positive"
    : "generic_negative";
}

function normalizeEventKey(value: unknown, event: string, category: string, analysis: string, recommendation: string, perspective: string): string {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (STABLE_EVENT_KEYS.has(normalized)) return normalized;
  }

  return inferEventKey(event, category, analysis, recommendation, perspective);
}

function pickStableLabel(eventKey: string, fallback: string): string {
  return EVENT_KEY_LABELS[eventKey] || fallback.trim() || "Gameplay Moment";
}

function pickStableRecommendation(eventKey: string, fallback: string): string {
  return EVENT_KEY_RECOMMENDATIONS[eventKey] || fallback;
}

function dedupeStableMoments(moments: VideoAnalysisResult["keyMoments"]): VideoAnalysisResult["keyMoments"] {
  const seen = new Set<string>();
  const output: VideoAnalysisResult["keyMoments"] = [];

  for (const moment of moments) {
    const bucket = Math.max(0, Math.round(timestampToSeconds(moment.timestamp)));
    const key = `${bucket}:${moment.eventKey}:${moment.perspective}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(moment);
  }

  return output;
}

function timestampToSeconds(timestamp: string): number {
  const [mins, secs] = timestamp.split(":").map((v) => Number.parseInt(v.trim(), 10));
  if (!Number.isFinite(mins) || !Number.isFinite(secs)) return 0;
  return mins * 60 + secs;
}

function asKeyMoments(value: unknown): VideoAnalysisResult["keyMoments"] {
  if (!Array.isArray(value)) return [];

  const output: VideoAnalysisResult["keyMoments"] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const moment = item as Record<string, unknown>;

    const timestamp = typeof moment.timestamp === "string" ? moment.timestamp.trim() : "";
    const event = typeof moment.event === "string" ? moment.event.trim() : "";
    if (!timestamp || !event) continue;

    const analysis = typeof moment.analysis === "string" ? moment.analysis.trim() : event;
    const recommendation = typeof moment.recommendation === "string" ? moment.recommendation.trim() : "";
    const combinedText = `${event} ${analysis} ${recommendation}`.toLowerCase();
    const killcamMoment = isKillcamText(combinedText);
    const perspective = normalizePerspective(moment.perspective, combinedText);
    const category =
      typeof moment.category === "string"
        ? normalizeKillcamMomentCategory(moment.category.trim(), combinedText)
        : "decision";
    const eventKey = normalizeEventKey(moment.eventKey, event, category, analysis, recommendation, perspective);

    if ((killcamMoment || perspective === "killcam_inference") && !referencesPlayerMistake(combinedText)) {
      continue;
    }
    if (perspective === "non_playable_state") continue;

    output.push({
      timestamp,
      event: pickStableLabel(eventKey, event),
      eventKey,
      category,
      rating: typeof moment.rating === "string" ? moment.rating.trim().toLowerCase() : "neutral",
      analysis,
      recommendation: pickStableRecommendation(eventKey, recommendation),
      confidence:
        perspective === "killcam_inference"
          ? "medium"
          : typeof moment.confidence === "string"
          ? moment.confidence.trim().toLowerCase()
          : "medium",
      perspective,
    });

    if (output.length >= 40) break;
  }

  return dedupeStableMoments(output);
}

function fallbackObservations(rawText: string): string[] {
  const cleaned = stripCodeFence(rawText).replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  if (cleaned.startsWith("{")) {
    return ["Model output could not be fully parsed. Report quality may be reduced for this run."];
  }
  return [cleaned.slice(0, 700)];
}

export interface VideoAnalysisResult {
  gameMode: string | null;
  mapName: string | null;
  observations: string[];
  keyMoments: Array<{
    timestamp: string;
    event: string;
    eventKey: string;
    category: string;
    rating: string;
    analysis: string;
    recommendation: string;
    confidence: string;
    perspective: "player_pov" | "killcam_inference" | "non_playable_state";
  }>;
  aimNotes: string[];
  movementNotes: string[];
  positioningNotes: string[];
  decisionNotes: string[];
  rawAnalysis: string;
}

export async function analyzeVideo(videoPath: string): Promise<VideoAnalysisResult> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const mimeType = getMimeType(videoPath);
  const videoStats = await stat(videoPath);
  const sizeMb = (videoStats.size / 1024 / 1024).toFixed(1);
  if (videoStats.size > MAX_ANALYZABLE_VIDEO_BYTES) {
    throw new Error(
      `Video is too large for reliable analysis (${sizeMb}MB). Please upload 512MB or smaller.`
    );
  }

  console.log(`[Gemini] Uploading video (${sizeMb}MB) for analysis...`);

  const uploaded = await ai.files.upload({
    file: videoPath,
    config: { mimeType },
  });

  if (!uploaded.name) {
    throw new Error("Gemini upload failed: missing file handle.");
  }

  const activeFile = await waitForFileActive(ai, uploaded.name);
  if (!activeFile.uri) {
    throw new Error("Gemini upload failed: missing file URI.");
  }

  console.log(`[Gemini] File ready, generating report with ${model}...`);

  const response = await ai.models.generateContent({
    model,
    contents: createUserContent([
      createPartFromUri(activeFile.uri, activeFile.mimeType || mimeType),
      "Analyze this Call of Duty: Black Ops 7 gameplay video and return strict JSON in the required schema.",
    ]),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
      temperature: 0,
    },
  });

  const rawAnalysis = response.text || "";
  const parsed = parseModelPayload(rawAnalysis);

  if (!parsed) {
    return {
      gameMode: null,
      mapName: null,
      observations: fallbackObservations(rawAnalysis),
      keyMoments: [],
      aimNotes: [],
      movementNotes: [],
      positioningNotes: [],
      decisionNotes: [],
      rawAnalysis,
    };
  }

  return {
    gameMode: normalizeGameMode(parsed.gameMode),
    mapName: asNullableString(parsed.mapName),
    observations: asStringArray(parsed.observations, 8),
    keyMoments: asKeyMoments(parsed.keyMoments),
    aimNotes: asStringArray(parsed.aimNotes, 8),
    movementNotes: asStringArray(parsed.movementNotes, 8),
    positioningNotes: asStringArray(parsed.positioningNotes, 8),
    decisionNotes: asStringArray(parsed.decisionNotes, 8),
    rawAnalysis,
  };
}

async function waitForFileActive(ai: GoogleGenAI, fileName: string): Promise<any> {
  const started = Date.now();

  while (Date.now() - started < FILE_PROCESS_TIMEOUT_MS) {
    const current = await ai.files.get({ name: fileName });
    const state = String(current.state || "");

    if (state === "ACTIVE") return current;
    if (state === "FAILED") {
      const fileError = current.error?.message || "Gemini failed to process the uploaded video.";
      throw new Error(fileError);
    }

    await new Promise((resolve) => setTimeout(resolve, FILE_POLL_INTERVAL_MS));
  }

  throw new Error("Timed out while Gemini processed the uploaded video.");
}
