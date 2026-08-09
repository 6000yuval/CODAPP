import {
  CoachingReport,
  ConfidenceLevel,
  CoverageScope,
  CriticalMoment,
  HabitLeak,
  Insight,
  ProAlternative,
  RecurringPattern,
  ScorecardMetric,
  TrainingGoal,
} from "../types/report.js";
import { VideoAnalysisResult } from "./videoAnalyzer.js";

const RATING_TO_SCORE: Record<string, number> = {
  excellent: 9.5,
  good: 8,
  neutral: 6,
  bad: 3.8,
  terrible: 2.2,
};

const NEGATIVE_MARKERS = [
  "bad",
  "poor",
  "miss",
  "inconsistent",
  "late",
  "slow",
  "panic",
  "over",
  "ego",
  "wrong",
  "hesitat",
  "tunnel",
  "exposed",
  "open lane",
  "untradeable",
  "re-chall",
];

const POSITIVE_MARKERS = [
  "good",
  "great",
  "excellent",
  "solid",
  "strong",
  "clean",
  "disciplined",
  "smart",
  "consistent",
  "effective",
  "trade",
  "advantage",
];

const BAD_RATINGS = new Set(["bad", "terrible"]);
const GOOD_RATINGS = new Set(["good", "excellent"]);

type Category =
  | "aim"
  | "movement"
  | "positioning"
  | "decision"
  | "awareness"
  | "mechanical"
  | "teamplay"
  | "objective";

function clampScore(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value * 10) / 10));
}

function avg(values: number[], fallback = 5.5): number {
  if (values.length === 0) return fallback;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

function scoreFromTextSentiment(textParts: string[], fallback = 5.5): number {
  const text = textParts.join(" ").toLowerCase();
  if (!text.trim()) return fallback;

  let positives = 0;
  let negatives = 0;

  for (const marker of POSITIVE_MARKERS) {
    if (text.includes(marker)) positives += 1;
  }
  for (const marker of NEGATIVE_MARKERS) {
    if (text.includes(marker)) negatives += 1;
  }

  const delta = (positives - negatives) * 0.35;
  return clampScore(fallback + delta);
}

function parseTimestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map((p) => Number.parseInt(p.trim(), 10));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0;
  return parts[0] * 60 + parts[1];
}

function normalizeMoment(raw: any): CriticalMoment | null {
  if (!raw.timestamp || !raw.event) return null;

  const category = (raw.category || "decision") as Category;
  const rating = (raw.rating || "neutral").toLowerCase() as CriticalMoment["rating"];
  const confidence = (raw.confidence || "medium").toLowerCase() as CriticalMoment["confidence"];

  return {
    timestamp: raw.timestamp,
    event: raw.event,
    eventKey: raw.eventKey || "generic_negative",
    category,
    rating: ["excellent", "good", "neutral", "bad", "terrible"].includes(rating) ? rating : "neutral",
    analysis: raw.analysis || raw.event,
    recommendation: raw.recommendation || "",
    confidence: ["high", "medium", "low"].includes(confidence) ? confidence : "medium",
    perspective:
      raw.perspective === "killcam_inference" || raw.perspective === "non_playable_state"
        ? raw.perspective
        : "player_pov",
  };
}

function stableSentimentDelta(notes: string[], observations: number, scope: CoverageScope): number {
  if (scope === "short_clip" || observations < 3) return 0;
  return sentimentDelta(notes);
}

function sentimentDelta(notes: string[]): number {
  if (notes.length === 0) return 0;
  const text = notes.join(" ").toLowerCase();
  let positives = 0;
  let negatives = 0;

  for (const token of POSITIVE_MARKERS) {
    if (text.includes(token)) positives += 1;
  }
  for (const token of NEGATIVE_MARKERS) {
    if (text.includes(token)) negatives += 1;
  }

  return Math.max(-1.5, Math.min(1.5, (positives - negatives) * 0.25));
}

function dedupeStrings(input: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of input) {
    const normalized = item.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function pickByKeywords(lines: string[], keywords: string[], limit = 4): string[] {
  return dedupeStrings(
    lines.filter((line) => {
      const lower = line.toLowerCase();
      return keywords.some((k) => lower.includes(k));
    })
  ).slice(0, limit);
}

function categoryAverage(
  moments: CriticalMoment[],
  categories: Category[],
  fallback: number
): number {
  const scores = moments
    .filter((m) => categories.includes(m.category as Category))
    .map((m) => RATING_TO_SCORE[m.rating] ?? 6);
  return avg(scores, fallback);
}

function badRatio(moments: CriticalMoment[], categories: Category[]): number {
  const filtered = moments.filter((m) => categories.includes(m.category as Category));
  if (filtered.length === 0) return 0;
  const badCount = filtered.filter((m) => BAD_RATINGS.has(m.rating)).length;
  return badCount / filtered.length;
}

function buildInsights(
  moments: CriticalMoment[],
  isPositive: boolean,
  fallbackText: string
): Insight[] {
  const filtered = moments.filter((m) =>
    isPositive ? GOOD_RATINGS.has(m.rating) : BAD_RATINGS.has(m.rating)
  );
  if (filtered.length === 0) {
    return [{
      title: isPositive ? "No clear positive spikes identified" : "No major mistakes extracted",
      description: fallbackText,
      severity: isPositive ? "low" : "medium",
    }];
  }

  return filtered.slice(0, 5).map((m) => ({
    title: m.event.length > 80 ? `${m.event.slice(0, 77)}...` : m.event,
    description: m.analysis,
    severity: isPositive
      ? "low"
      : m.rating === "terrible"
      ? "critical"
      : "high",
  }));
}

function buildRecurringPatterns(moments: CriticalMoment[]): RecurringPattern[] {
  const badMoments = moments.filter((m) => BAD_RATINGS.has(m.rating));
  const counts: Record<string, number> = {
    decision: 0,
    positioning: 0,
    aim: 0,
    movement: 0,
    awareness: 0,
    objective: 0,
  };

  for (const moment of badMoments) {
    if (counts[moment.category] !== undefined) counts[moment.category] += 1;
  }

  const patterns: RecurringPattern[] = [];
  if (counts.decision >= 2) {
    patterns.push({
      pattern: "Low-percentage engagement choices",
      frequency: counts.decision >= 4 ? "constant" : "frequent",
      impact: "high",
      description: "Multiple moments show forced fights or re-challenges without enough information.",
    });
  }
  if (counts.positioning + counts.awareness >= 2) {
    patterns.push({
      pattern: "Unsafe positioning under pressure",
      frequency: counts.positioning + counts.awareness >= 4 ? "constant" : "frequent",
      impact: "high",
      description: "Repeated exposure in open lanes or weak cover usage appears across several moments.",
    });
  }
  if (counts.aim + counts.movement >= 2) {
    patterns.push({
      pattern: "Mechanical execution inconsistency",
      frequency: counts.aim + counts.movement >= 4 ? "frequent" : "occasional",
      impact: "medium",
      description: "Gunfight execution quality fluctuates, causing missed conversion opportunities.",
    });
  }

  return patterns.slice(0, 3);
}

function coverageScopeFromTimeline(timeline: CriticalMoment[]): { scope: CoverageScope; maxTimestamp: string | null } {
  if (timeline.length === 0) return { scope: "short_clip", maxTimestamp: null };
  const maxMoment = timeline.reduce((max, cur) =>
    parseTimestampToSeconds(cur.timestamp) > parseTimestampToSeconds(max.timestamp) ? cur : max
  );
  const maxSec = parseTimestampToSeconds(maxMoment.timestamp);

  if (maxSec >= 8 * 60) return { scope: "full_vod", maxTimestamp: maxMoment.timestamp };
  if (maxSec >= 3 * 60) return { scope: "medium_segment", maxTimestamp: maxMoment.timestamp };
  return { scope: "short_clip", maxTimestamp: maxMoment.timestamp };
}

function confidenceFromCount(count: number, scope: CoverageScope, minForScore: number): ConfidenceLevel {
  if (count < minForScore) return "insufficient_sample";
  if (scope === "full_vod" && count >= 6) return "high";
  if (count >= 3) return "medium";
  return "low";
}

function momentConfidenceToScore(confidence: CriticalMoment["confidence"]): ConfidenceLevel {
  if (confidence === "high") return "high";
  if (confidence === "medium") return "medium";
  return "low";
}

function categoryCounts(timeline: CriticalMoment[]): Record<string, number> {
  const counts: Record<string, number> = {
    aim: 0,
    movement: 0,
    positioning: 0,
    decision: 0,
    awareness: 0,
    mechanical: 0,
    objective: 0,
    teamplay: 0,
  };
  for (const moment of timeline) {
    counts[moment.category] = (counts[moment.category] || 0) + 1;
  }
  return counts;
}

function buildHabitLeaks(
  recurringPatterns: RecurringPattern[],
  timeline: CriticalMoment[],
  topThreePriorities: string[],
  scope: CoverageScope
): HabitLeak[] {
  const badMoments = timeline.filter((m) => BAD_RATINGS.has(m.rating));

  const leaks: HabitLeak[] = [];

  if (badMoments.some((m) => m.category === "decision" || m.analysis.toLowerCase().includes("re-chall") || m.analysis.toLowerCase().includes("ego"))) {
    leaks.push({
      name: "Overheat After Blood",
      trigger: "After first contact or a pick, immediate re-chall without cover reset.",
      replacement: "Kill -> Cover -> Clear next threat lane before re-peeking.",
      drill: "Cue word: KCC. Repeat in 10 ranked fights: no second peek until cover touch.",
      impact: "high",
      punishment: "iridescent",
      confidence: scope === "short_clip" ? "medium" : "high",
      evidence: badMoments.slice(0, 2).map((m) => `${m.timestamp} - ${m.event}`),
    });
  }

  if (badMoments.some((m) => m.category === "positioning" || m.category === "awareness")) {
    leaks.push({
      name: "Untradeable Wide Exposure",
      trigger: "Taking gunfights while open to multiple angles with weak teammate trade access.",
      replacement: "Slice one angle at a time and anchor to cover before committing damage.",
      drill: "In your next 3 maps, call out your cover before each chall: left/right hard cover only.",
      impact: "high",
      punishment: "top250",
      confidence: scope === "full_vod" ? "high" : "medium",
      evidence: badMoments.filter((m) => m.category === "positioning" || m.category === "awareness").slice(0, 2).map((m) => `${m.timestamp} - ${m.event}`),
    });
  }

  if (badMoments.some((m) => m.category === "aim" || m.category === "movement" || m.category === "mechanical")) {
    leaks.push({
      name: "Inconsistent Conversion Discipline",
      trigger: "First bullets land, but follow-up movement/finishing sequence is unstable.",
      replacement: "Prioritize first bullet accuracy plus damage conversion over flashy movement.",
      drill: "15-minute private match block: pre-aim lanes, no sprint into LOS, track conversion percentage.",
      impact: "medium",
      punishment: "crimson",
      confidence: "medium",
      evidence: badMoments.filter((m) => m.category === "aim" || m.category === "movement" || m.category === "mechanical").slice(0, 2).map((m) => `${m.timestamp} - ${m.event}`),
    });
  }

  for (const pattern of recurringPatterns) {
    if (leaks.length >= 3) break;
    leaks.push({
      name: pattern.pattern,
      trigger: pattern.description,
      replacement: topThreePriorities[leaks.length] || "Prioritize survivable fights with teammate trade paths.",
      drill: "Tag each occurrence in your next map and force one deliberate correction per occurrence.",
      impact: pattern.impact === "high" ? "high" : "medium",
      punishment: pattern.impact === "high" ? "iridescent" : "crimson",
      confidence: pattern.frequency === "constant" ? "high" : "medium",
      evidence: badMoments.slice(0, 2).map((m) => `${m.timestamp} - ${m.event}`),
    });
  }

  const unique = dedupeStrings(leaks.map((l) => l.name));
  const finalLeaks = unique.map((name) => leaks.find((l) => l.name === name)!).filter(Boolean).slice(0, 3);

  while (finalLeaks.length < 3) {
    finalLeaks.push({
      name: `SR Leak ${finalLeaks.length + 1}`,
      trigger: "Insufficient repeated moments captured for a stronger taxonomy label.",
      replacement: topThreePriorities[finalLeaks.length] || "Play lower-risk, higher-trade percentage fights.",
      drill: "Track this mistake manually over your next 3 ranked games.",
      impact: "medium",
      punishment: "crimson",
      confidence: "insufficient_sample",
      evidence: [],
    });
  }

  return finalLeaks;
}

function buildProAlternatives(badMoments: CriticalMoment[]): ProAlternative[] {
  if (badMoments.length === 0) {
    return [{
      situation: "No high-confidence bad moment extracted",
      safest: "Play life and hold crossfires before forcing contact.",
      aggressive: "Only force when teammate can trade in under 2 seconds.",
      soloQueue: "Default to survival and info unless you see a guaranteed isolated duel.",
    }];
  }

  return badMoments.slice(0, 3).map((moment) => ({
    situation: `${moment.timestamp} - ${moment.event}`,
    safest: moment.recommendation || "Disengage, reset to cover, and re-clear high-threat lanes.",
    aggressive: "Re-chall only with pre-aim + cover touch + teammate pressure active.",
    soloQueue: "Take the 70/30 version of this fight. If no trade path, disengage and hold info.",
  }));
}

function buildScorecardMetric(params: {
  key: string;
  label: string;
  score: number;
  observations: number;
  scope: CoverageScope;
  minForScore?: number;
}): ScorecardMetric {
  const minForScore = params.minForScore ?? (params.scope === "full_vod" ? 2 : 3);
  const confidence = confidenceFromCount(params.observations, params.scope, minForScore);

  if (confidence === "insufficient_sample") {
    return {
      key: params.key,
      label: params.label,
      score: null,
      observations: params.observations,
      confidence,
      scope: params.scope,
      reason: `Requires at least ${minForScore} relevant observations for a defensible score.`,
    };
  }

  return {
    key: params.key,
    label: params.label,
    score: clampScore(params.score),
    observations: params.observations,
    confidence,
    scope: params.scope,
  };
}

function buildTrainingPrescription(habits: HabitLeak[]): TrainingGoal[] {
  return habits.slice(0, 3).map((habit, idx) => ({
    title: `${idx + 1}. ${habit.name}`,
    cue: habit.name.toLowerCase().includes("blood")
      ? "Kill-Cover-Clear"
      : habit.name.toLowerCase().includes("exposure")
      ? "Cover before Chall"
      : "Stable First Bullets",
    prescription: habit.drill,
    target: habit.impact === "high"
      ? "Cut this habit by 50% over the next 5 ranked maps."
      : "Cut this habit by 30% over the next 5 ranked maps.",
  }));
}

export function buildReportFromVideoAnalysis(analysis: VideoAnalysisResult): CoachingReport {
  const timeline = (analysis.keyMoments || [])
    .map((moment) => normalizeMoment(moment))
    .filter((moment): moment is CriticalMoment => moment !== null)
    .sort((a, b) => parseTimestampToSeconds(a.timestamp) - parseTimestampToSeconds(b.timestamp));

  const textualSignals = [
    ...(analysis.observations || []),
    ...(analysis.aimNotes || []),
    ...(analysis.movementNotes || []),
    ...(analysis.positioningNotes || []),
    ...(analysis.decisionNotes || []),
    analysis.rawAnalysis || "",
  ];

  const { scope, maxTimestamp } = coverageScopeFromTimeline(timeline);
  const counts = categoryCounts(timeline);
  const hasTimeline = timeline.length > 0;

  const globalBase = hasTimeline
    ? avg(timeline.map((m) => RATING_TO_SCORE[m.rating] ?? 6), 5.5)
    : scoreFromTextSentiment(textualSignals, 5.5);

  const aimFallback = scoreFromTextSentiment(
    (analysis.aimNotes || []).length > 0
      ? [...(analysis.aimNotes || []), ...(analysis.observations || [])]
      : textualSignals,
    globalBase + 0.1
  );
  const movementFallback = scoreFromTextSentiment(
    (analysis.movementNotes || []).length > 0
      ? [...(analysis.movementNotes || []), ...(analysis.observations || [])]
      : textualSignals,
    globalBase
  );
  const positioningFallback = scoreFromTextSentiment(
    (analysis.positioningNotes || []).length > 0
      ? [...(analysis.positioningNotes || []), ...(analysis.observations || [])]
      : textualSignals,
    globalBase - 0.15
  );
  const decisionFallback = scoreFromTextSentiment(
    (analysis.decisionNotes || []).length > 0
      ? [...(analysis.decisionNotes || []), ...(analysis.observations || [])]
      : textualSignals,
    globalBase - 0.25
  );

  const aimBase = hasTimeline
    ? categoryAverage(timeline, ["aim", "mechanical"], globalBase)
    : aimFallback;
  const movementBase = hasTimeline
    ? categoryAverage(timeline, ["movement", "mechanical"], globalBase)
    : movementFallback;
  const positioningBase = hasTimeline
    ? categoryAverage(timeline, ["positioning", "awareness"], globalBase)
    : positioningFallback;
  const decisionBase = hasTimeline
    ? categoryAverage(timeline, ["decision", "objective", "teamplay"], globalBase)
    : decisionFallback;

  const aimBad = badRatio(timeline, ["aim", "mechanical"]);
  const movementBad = badRatio(timeline, ["movement", "mechanical"]);
  const positioningBad = badRatio(timeline, ["positioning", "awareness"]);
  const decisionBad = badRatio(timeline, ["decision", "objective", "teamplay"]);

  const aimObservations = counts.aim + counts.mechanical;
  const movementObservations = counts.movement + counts.mechanical;
  const positioningObservations = counts.positioning + counts.awareness;
  const decisionObservations = counts.decision + counts.objective + counts.teamplay;

  const aimNotesDelta = stableSentimentDelta(analysis.aimNotes || [], aimObservations, scope);
  const movementNotesDelta = stableSentimentDelta(analysis.movementNotes || [], movementObservations, scope);
  const positioningNotesDelta = stableSentimentDelta(analysis.positioningNotes || [], positioningObservations, scope);
  const decisionNotesDelta = stableSentimentDelta(analysis.decisionNotes || [], decisionObservations, scope);

  const mechanicalReview = {
    aimQuality: clampScore(aimBase + aimNotesDelta - aimBad * 1.4),
    centering: clampScore(aimBase + aimNotesDelta * 0.6 - aimBad * 1.2 + 0.2),
    recoilControl: clampScore(aimBase + aimNotesDelta * 0.5 - aimBad * 1.1 - 0.1),
    tracking: clampScore(aimBase + aimNotesDelta * 0.4 - aimBad * 1.0 + 0.1),
    flickAccuracy: clampScore(aimBase + aimNotesDelta * 0.3 - aimBad * 1.0),
    crosshairPlacement: clampScore(aimBase + aimNotesDelta * 0.7 - aimBad * 1.3 + 0.15),
    movementQuality: clampScore(movementBase + movementNotesDelta - movementBad * 1.4),
    slideJumpUsage: clampScore(movementBase + movementNotesDelta * 0.8 - movementBad * 1.2 + 0.1),
    notes: dedupeStrings([...(analysis.aimNotes || []), ...(analysis.movementNotes || [])]).slice(0, 10),
  };

  const decisionCorpus = [
    ...(analysis.decisionNotes || []),
    ...timeline
      .filter((m) => m.category === "decision" || m.category === "objective")
      .map((m) => m.analysis),
  ];

  const decisionMakingReview = {
    engagementSelection: clampScore(decisionBase + decisionNotesDelta - decisionBad * 1.5),
    rotationTiming: clampScore(decisionBase + decisionNotesDelta * 0.7 - decisionBad * 1.2 + 0.1),
    objectivePlay: clampScore(
      categoryAverage(timeline, ["objective", "decision", "teamplay"], decisionBase) +
      decisionNotesDelta * 0.6 -
      badRatio(timeline, ["objective", "teamplay"]) * 1.3
    ),
    overChallenges: pickByKeywords(decisionCorpus, ["over", "re-chall", "rechallenge", "repeat"], 5),
    egoChalls: pickByKeywords(decisionCorpus, ["ego", "unnecessary", "forced fight"], 5),
    badPeeks: pickByKeywords(decisionCorpus, ["peek", "wide swing", "dry peek", "swing"], 5),
    notes: dedupeStrings(analysis.decisionNotes || []).slice(0, 10),
  };

  const positioningReview = {
    mapAwareness: clampScore(positioningBase + positioningNotesDelta - positioningBad * 1.4),
    useOfCover: clampScore(positioningBase + positioningNotesDelta * 0.8 - positioningBad * 1.3),
    spawnAwareness: clampScore(positioningBase + positioningNotesDelta * 0.6 - positioningBad * 1.1 + 0.2),
    powerPositions: clampScore(positioningBase + positioningNotesDelta * 0.7 - positioningBad * 1.1),
    routeChoices: clampScore(positioningBase + positioningNotesDelta * 0.6 - positioningBad * 1.0 + 0.1),
    dangerZoneAwareness: clampScore(positioningBase + positioningNotesDelta * 0.7 - positioningBad * 1.2),
    notes: dedupeStrings(analysis.positioningNotes || []).slice(0, 10),
  };

  const overallRating = clampScore(
    avg([
      mechanicalReview.aimQuality,
      mechanicalReview.movementQuality,
      decisionMakingReview.engagementSelection,
      positioningReview.mapAwareness,
      decisionMakingReview.objectivePlay,
    ], globalBase)
  );

  const keyMistakes = buildInsights(
    timeline,
    false,
    "No high-confidence major mistakes were explicitly extracted in this run."
  );
  const keyStrengths = buildInsights(
    timeline,
    true,
    "No strong positive spikes were confidently detected in this VOD."
  );
  const recurringPatterns = buildRecurringPatterns(timeline);

  const badMoments = timeline.filter((m) => BAD_RATINGS.has(m.rating));
  const topThreePriorities = dedupeStrings([
    ...(badMoments.map((m) => m.recommendation).filter(Boolean)),
    "Take fewer isolated fights without teammate support or lane info.",
    "Anchor to cover before challenging to improve survival and trade potential.",
    "Stabilize gunfight mechanics with disciplined centering and pre-aiming.",
  ]).slice(0, 3);

  const srLeakingHabits = buildHabitLeaks(recurringPatterns, timeline, topThreePriorities, scope);
  const proAlternatives = buildProAlternatives(badMoments);

  const scorecards: ScorecardMetric[] = [
    buildScorecardMetric({
      key: "overall",
      label: "Overall Competitive Read",
      score: overallRating,
      observations: timeline.length,
      scope,
      minForScore: scope === "full_vod" ? 3 : 5,
    }),
    buildScorecardMetric({
      key: "aim_quality",
      label: "Aim Quality",
      score: mechanicalReview.aimQuality,
      observations: aimObservations,
      scope,
    }),
    buildScorecardMetric({
      key: "movement_quality",
      label: "Movement Quality",
      score: mechanicalReview.movementQuality,
      observations: movementObservations,
      scope,
    }),
    buildScorecardMetric({
      key: "engagement_selection",
      label: "Engagement Selection",
      score: decisionMakingReview.engagementSelection,
      observations: counts.decision + counts.objective,
      scope,
      minForScore: scope === "full_vod" ? 2 : 4,
    }),
    buildScorecardMetric({
      key: "rotation_timing",
      label: "Rotation Timing",
      score: decisionMakingReview.rotationTiming,
      observations: counts.objective,
      scope,
      minForScore: 4,
    }),
    buildScorecardMetric({
      key: "objective_play",
      label: "Objective Play",
      score: decisionMakingReview.objectivePlay,
      observations: counts.objective + counts.teamplay,
      scope,
      minForScore: 4,
    }),
    buildScorecardMetric({
      key: "map_awareness",
      label: "Map Awareness",
      score: positioningReview.mapAwareness,
      observations: positioningObservations,
      scope,
    }),
    buildScorecardMetric({
      key: "spawn_awareness",
      label: "Spawn Awareness",
      score: positioningReview.spawnAwareness,
      observations: counts.objective + counts.positioning,
      scope,
      minForScore: 4,
    }),
  ];

  const highConfidenceCount = scorecards.filter((m) => m.confidence === "high").length;
  const mediumConfidenceCount = scorecards.filter((m) => m.confidence === "medium").length;
  const verdictConfidence: ConfidenceLevel =
    highConfidenceCount >= 3 ? "high" : mediumConfidenceCount >= 2 ? "medium" : timeline.length >= 2 ? "low" : "insufficient_sample";

  const primaryIssue = srLeakingHabits[0]?.name || "inconsistent decision-making under pressure";
  const coachVerdict = {
    verdict:
      overallRating >= 7
        ? "Your baseline is strong enough to climb, but discipline leaks are capping consistency."
        : "Gunny flashes are there, but sequence discipline is leaking too much SR.",
    bottleneck: primaryIssue,
    confidence: verdictConfidence,
    basedOn: `${timeline.length} tagged moments across ${scope.replace("_", " ")}${maxTimestamp ? ` (up to ${maxTimestamp})` : ""}.`,
    scope,
  };

  const overview =
    dedupeStrings(analysis.observations || []).slice(0, 2).join(" ") ||
    (timeline.length > 0
      ? `Review found repeat punish patterns around ${primaryIssue.toLowerCase()} and post-contact discipline.`
      : "Analysis completed with limited timestamp extraction. Metrics are gated for sample quality.");

  const trainingPrescription = buildTrainingPrescription(srLeakingHabits);

  const evidenceAppendix = {
    nonPlayableStateEvidence: dedupeStrings(
      timeline
        .filter((m) => m.perspective === "killcam_inference" || m.perspective === "non_playable_state")
        .map((m) => `${m.timestamp}: ${m.event} [${m.perspective}]`)
    ).slice(0, 8),
    observedFacts: timeline.slice(0, 8).map((m) => `${m.timestamp}: ${m.event} (${m.rating})`),
    inferences: dedupeStrings([
      ...recurringPatterns.map((p) => `${p.pattern}: ${p.description}`),
      ...srLeakingHabits.map((h) => `${h.name} inferred from repeated punish windows.`),
    ]).slice(0, 8),
    limitations: dedupeStrings([
      timeline.some((m) => m.perspective === "killcam_inference")
        ? "Some death reviews were derived from killcam evidence and should inform your mistake, not be treated as your direct mechanics."
        : "",
      scope === "short_clip"
        ? "Short clip sample: some mode-level metrics (rotation/spawn/objective) are gated or inferred."
        : "",
      counts.objective < 4
        ? "Objective-layer sample is limited; rotation and spawn scores are confidence-gated."
        : "",
      timeline.length < 5
        ? "Low number of timestamped moments reduces certainty for recurring pattern detection."
        : "",
    ]).slice(0, 5),
    sampleSize: {
      timelineMoments: timeline.length,
      scope,
      maxTimestamp,
      categoryObservations: counts,
    },
  };

  const strongestAreas = dedupeStrings([
    mechanicalReview.aimQuality >= 7 ? "you can win clean gunfights" : "",
    positioningReview.mapAwareness >= 7 ? "your map awareness has good moments" : "",
    decisionMakingReview.engagementSelection >= 7 ? "you can pick good fights when composed" : "",
    ...keyStrengths
      .filter((s) => s.title !== "No clear positive spikes identified")
      .map((s) => s.title.toLowerCase()),
  ]).slice(0, 2);

  const weakestAreas = dedupeStrings([
    srLeakingHabits[0]?.name ? srLeakingHabits[0].name.toLowerCase() : "",
    positioningReview.mapAwareness < 6 ? "positioning under pressure" : "",
    decisionMakingReview.engagementSelection < 6 ? "fight decisions after contact" : "",
    ...keyMistakes
      .filter((m) => m.title !== "No major mistakes extracted")
      .map((m) => m.title.toLowerCase()),
  ]).slice(0, 3);

  const stopNow = weakestAreas[0] || "ego re-challs after first contact";
  const startNow = topThreePriorities[0] || "kill -> cover -> threat clear before your next peek";
  const rankedPlan = trainingPrescription
    .slice(0, 3)
    .map((goal, idx) => `${idx + 1}) ${goal.title.replace(/^\d+\.\s*/, "")}: ${goal.prescription} Target: ${goal.target}`);

  const coachingSummary = [
    `Your profile in this VOD: Aim ${mechanicalReview.aimQuality}/10, Positioning ${positioningReview.mapAwareness}/10, Decision-Making ${decisionMakingReview.engagementSelection}/10.`,
    strongestAreas.length > 0
      ? `What you are doing well: ${strongestAreas.join("; ")}.`
      : "What you are doing well: you still show enough mechanics to convert fights when setup is clean.",
    `What is costing you SR right now: ${weakestAreas.join("; ") || primaryIssue.toLowerCase()}.`,
    `Stop doing this immediately: ${stopNow}.`,
    `Do this instead every fight: ${startNow}.`,
    "Next 5 ranked maps plan:",
    ...rankedPlan,
    "Success condition: fewer isolated deaths, fewer panic re-challs, and better life value after each first blood.",
  ].join("\n");

  return {
    overview,
    overallRating,
    gameMode: analysis.gameMode || null,
    mapName: analysis.mapName || null,
    keyStrengths,
    keyMistakes,
    timeline,
    recurringPatterns,
    mechanicalReview,
    decisionMakingReview,
    positioningReview,
    coachingSummary,
    topThreePriorities,
    coachVerdict,
    srLeakingHabits,
    proAlternatives,
    scorecards,
    trainingPrescription,
    evidenceAppendix,
  };
}
