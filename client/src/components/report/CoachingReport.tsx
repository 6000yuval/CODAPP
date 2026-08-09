"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, TrendingUp,
  Clock, Award, Eye, Download, PlayCircle,
  BookCheck, GraduationCap
} from "lucide-react";
import ScoreCircle from "./ScoreCircle";
import TimelineItem from "./TimelineItem";
import { getVideoUrl } from "@/lib/api";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  report: any;
  jobId: string;
  accessToken?: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-info/5 text-info border-info/15",
  medium: "bg-neutral/5 text-neutral border-neutral/15",
  high: "bg-bad/5 text-bad border-bad/15",
  critical: "bg-terrible/5 text-terrible border-terrible/15",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-excellent/15 text-excellent border border-excellent/25",
  medium: "bg-info/15 text-info border border-info/25",
  low: "bg-warning/15 text-warning border border-warning/25",
  insufficient_sample: "bg-danger/15 text-danger border border-danger/25",
};

function confidenceLabel(value: string | undefined): string {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function scoreStatus(score: number): "strong" | "ok" | "weak" {
  if (score >= 7) return "strong";
  if (score >= 5) return "ok";
  return "weak";
}

function statusStyle(status: "strong" | "ok" | "weak"): string {
  if (status === "strong") return "bg-excellent/10 text-excellent border-excellent/25";
  if (status === "ok") return "bg-warning/10 text-warning border-warning/25";
  return "bg-danger/10 text-danger border-danger/25";
}

function formatScore(value: unknown): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return "N/A";
  return `${num.toFixed(1)}/10`;
}

function buildDirectSummary(aimScore: number, positioningScore: number, decisionScore: number): string {
  const aim = scoreStatus(aimScore);
  const positioning = scoreStatus(positioningScore);
  const decision = scoreStatus(decisionScore);

  if (aim === "strong" && (positioning !== "strong" || decision !== "strong")) {
    return "You shoot well, but positioning and decision-making are costing you rounds.";
  }
  if (aim === "weak" && positioning === "strong" && decision === "strong") {
    return "Your game sense is solid, but your gunfights are holding you back.";
  }
  if (positioning === "weak" && decision === "weak") {
    return "Your biggest leaks are positioning and decisions after first contact.";
  }
  if (decision === "weak") {
    return "Your mechanics are playable, but your fight decisions are leaking SR.";
  }
  if (positioning === "weak") {
    return "Your aim is fine, but your positioning is too punishable.";
  }
  return "Your game is balanced overall, but you still need cleaner, lower-risk reps.";
}

function Section({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="flex items-center gap-3 text-xl font-bold text-white mb-5 pb-3 border-b border-border">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtmlReport(report: any): string {
  const timelineRows = (report.timeline || [])
    .map(
      (m: any) => `
      <div class="card">
        <div class="row">
          <span class="pill">${escapeHtml(m.timestamp)}</span>
          <strong>${escapeHtml(m.event)}</strong>
          <span class="pill">${escapeHtml(m.category)}</span>
          <span class="pill">${escapeHtml(m.rating)}</span>
        </div>
        <p>${escapeHtml(m.analysis)}</p>
        ${m.recommendation ? `<p><strong>Recommendation:</strong> ${escapeHtml(m.recommendation)}</p>` : ""}
      </div>`
    )
    .join("");
  const habitRows = (report.srLeakingHabits || [])
    .map(
      (h: any) => `
      <div class="card">
        <div class="row">
          <strong>${escapeHtml(h.name)}</strong>
          <span class="pill">${escapeHtml(h.punishment || "ranked")}</span>
          <span class="pill">${escapeHtml(h.confidence || "unknown")}</span>
        </div>
        <p><strong>Trigger:</strong> ${escapeHtml(h.trigger)}</p>
        <p><strong>Replacement:</strong> ${escapeHtml(h.replacement)}</p>
        <p><strong>Drill:</strong> ${escapeHtml(h.drill)}</p>
      </div>`
    )
    .join("");

  const breakdownColumns = [
    {
      title: "Aim",
      metrics: [
        ["Aim Quality", report.mechanicalReview?.aimQuality],
        ["Centering", report.mechanicalReview?.centering],
        ["Recoil Control", report.mechanicalReview?.recoilControl],
        ["Tracking", report.mechanicalReview?.tracking],
        ["Flick Accuracy", report.mechanicalReview?.flickAccuracy],
        ["Crosshair Placement", report.mechanicalReview?.crosshairPlacement],
        ["Movement Quality", report.mechanicalReview?.movementQuality],
        ["Slide/Jump Usage", report.mechanicalReview?.slideJumpUsage],
      ],
    },
    {
      title: "Positioning",
      metrics: [
        ["Map Awareness", report.positioningReview?.mapAwareness],
        ["Use of Cover", report.positioningReview?.useOfCover],
        ["Spawn Awareness", report.positioningReview?.spawnAwareness],
        ["Power Positions", report.positioningReview?.powerPositions],
        ["Route Choices", report.positioningReview?.routeChoices],
        ["Danger Zone Awareness", report.positioningReview?.dangerZoneAwareness],
      ],
    },
    {
      title: "Decision-Making",
      metrics: [
        ["Engagement Selection", report.decisionMakingReview?.engagementSelection],
        ["Rotation Timing", report.decisionMakingReview?.rotationTiming],
        ["Objective Play", report.decisionMakingReview?.objectivePlay],
        ["Over-Challenges (count)", (report.decisionMakingReview?.overChallenges || []).length],
        ["Ego Challs (count)", (report.decisionMakingReview?.egoChalls || []).length],
        ["Bad Peeks (count)", (report.decisionMakingReview?.badPeeks || []).length],
      ],
    },
  ];

  const breakdownHtml = breakdownColumns
    .map(
      (col) => `
      <div class="card">
        <h3>${escapeHtml(col.title)}</h3>
        ${col.metrics
          .map(
            ([label, value]) =>
              `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(formatScore(value))}</p>`
          )
          .join("")}
      </div>`
    )
    .join("");

  const list = (items: any[]) =>
    (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VOD Report - ${escapeHtml(report.mapName || "Gameplay")}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #e5e7eb; background: #0b1020; }
    h1, h2, h3 { color: #ffffff; }
    .meta { opacity: .8; margin-bottom: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .card { background: #111831; border: 1px solid #263155; border-radius: 12px; padding: 12px; margin: 10px 0; }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
    .pill { font-size: 12px; background: #1d2a50; padding: 4px 8px; border-radius: 999px; border: 1px solid #33416e; }
    ul { margin-top: 8px; }
    li { margin: 4px 0; }
    .score { font-size: 28px; font-weight: bold; color: #22c55e; }
  </style>
</head>
<body>
  <h1>Pro VOD Review</h1>
  <p class="meta"><strong>Map:</strong> ${escapeHtml(report.mapName || "Unknown")} | <strong>Mode:</strong> ${escapeHtml(report.gameMode || "Unknown")}</p>
  <p class="score">Overall Rating: ${escapeHtml(report.overallRating)}/10</p>
  <div class="card">
    <h2>Overview</h2>
    <p>${escapeHtml(report.overview)}</p>
  </div>
  <div class="card">
    <h2>Direct Summary</h2>
    <p>${escapeHtml(buildDirectSummary(
      Number(report?.mechanicalReview?.aimQuality ?? report?.overallRating ?? 5),
      Number(report?.positioningReview?.mapAwareness ?? report?.overallRating ?? 5),
      Number(report?.decisionMakingReview?.engagementSelection ?? report?.overallRating ?? 5)
    ))}</p>
  </div>
  <div class="grid">${breakdownHtml}</div>
  <div class="grid">
    <div class="card">
      <h3>Top Priorities</h3>
      <ul>${list(report.topThreePriorities || [])}</ul>
    </div>
    <div class="card">
      <h3>Key Strengths</h3>
      <ul>${list((report.keyStrengths || []).map((x: any) => x.title))}</ul>
    </div>
    <div class="card">
      <h3>Key Mistakes</h3>
      <ul>${list((report.keyMistakes || []).map((x: any) => x.title))}</ul>
    </div>
  </div>
  <div class="card">
    <h2>Top SR-Leaking Habits</h2>
    ${habitRows || "<p>No habit leaks extracted.</p>"}
  </div>
  <div class="card">
    <h2>Timestamp-by-Timestamp Analysis</h2>
    ${timelineRows || "<p>No timeline entries.</p>"}
  </div>
  <div class="card">
    <h2>Coach's Final Word</h2>
    <p>${escapeHtml(report.coachingSummary || "")}</p>
  </div>
</body>
</html>`;
}

export default function CoachingReport({ report, jobId, accessToken }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clipReviewRef = useRef<HTMLDivElement | null>(null);
  const clipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeMoment, setActiveMoment] = useState<any | null>(null);
  const aimScore = Number(report?.mechanicalReview?.aimQuality ?? report?.overallRating ?? 5);
  const positioningScore = Number(report?.positioningReview?.mapAwareness ?? report?.overallRating ?? 5);
  const decisionScore = Number(report?.decisionMakingReview?.engagementSelection ?? report?.overallRating ?? 5);
  const directSummary = buildDirectSummary(aimScore, positioningScore, decisionScore);
  const topPerformanceGroups = [
    {
      title: "Aim",
      overall: aimScore,
      metrics: [
        ["Aim Quality", report?.mechanicalReview?.aimQuality],
        ["Centering", report?.mechanicalReview?.centering],
        ["Recoil Control", report?.mechanicalReview?.recoilControl],
        ["Tracking", report?.mechanicalReview?.tracking],
        ["Flick Accuracy", report?.mechanicalReview?.flickAccuracy],
        ["Crosshair Placement", report?.mechanicalReview?.crosshairPlacement],
        ["Movement Quality", report?.mechanicalReview?.movementQuality],
        ["Slide/Jump Usage", report?.mechanicalReview?.slideJumpUsage],
      ] as Array<[string, unknown]>,
    },
    {
      title: "Positioning",
      overall: positioningScore,
      metrics: [
        ["Map Awareness", report?.positioningReview?.mapAwareness],
        ["Use of Cover", report?.positioningReview?.useOfCover],
        ["Spawn Awareness", report?.positioningReview?.spawnAwareness],
        ["Power Positions", report?.positioningReview?.powerPositions],
        ["Route Choices", report?.positioningReview?.routeChoices],
        ["Danger Zone Awareness", report?.positioningReview?.dangerZoneAwareness],
      ] as Array<[string, unknown]>,
    },
    {
      title: "Decision-Making",
      overall: decisionScore,
      metrics: [
        ["Engagement Selection", report?.decisionMakingReview?.engagementSelection],
        ["Rotation Timing", report?.decisionMakingReview?.rotationTiming],
        ["Objective Play", report?.decisionMakingReview?.objectivePlay],
        ["Over-Challenges (count)", (report?.decisionMakingReview?.overChallenges || []).length],
        ["Ego Challs (count)", (report?.decisionMakingReview?.egoChalls || []).length],
        ["Bad Peeks (count)", (report?.decisionMakingReview?.badPeeks || []).length],
      ] as Array<[string, unknown]>,
    },
  ];

  useEffect(() => {
    return () => {
      if (clipTimeoutRef.current) clearTimeout(clipTimeoutRef.current);
    };
  }, []);

  function parseTimestampToSeconds(timestamp: string): number {
    const parts = timestamp.split(":").map((v: string) => Number.parseInt(v, 10));
    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0;
    return parts[0] * 60 + parts[1];
  }

  function handlePlayMoment(moment: any) {
    const player = videoRef.current;
    if (!player) return;

    const scrollTarget = clipReviewRef.current || player;
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });

    const momentSec = parseTimestampToSeconds(moment.timestamp || "0:00");
    const start = Math.max(0, momentSec - 2);
    const end = momentSec + 8;
    setActiveMoment(moment);

    if (clipTimeoutRef.current) clearTimeout(clipTimeoutRef.current);

    const playClip = () => {
      player.currentTime = start;
      player.play().catch(() => {
        // Browser autoplay policies may block this until the user interacts.
      });

      clipTimeoutRef.current = setTimeout(() => {
        player.pause();
      }, Math.max(1, end - start) * 1000);
    };

    if (player.readyState >= 1) {
      playClip();
      return;
    }

    const onLoaded = () => {
      player.removeEventListener("loadedmetadata", onLoaded);
      playClip();
    };
    player.addEventListener("loadedmetadata", onLoaded);
  }

  function downloadReport() {
    const html = buildHtmlReport({
      ...report,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.1-html",
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeMap = (report.mapName || "vod-report").toString().replace(/[^a-zA-Z0-9-_]+/g, "-");
    a.href = url;
    a.download = `${safeMap}-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header card */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 bg-bg-card rounded-2xl p-8 border border-border gradient-border">
        <ScoreCircle score={report.overallRating || 5} />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
            <h1 className="text-3xl font-black text-white">Pro VOD Review</h1>
            {report.mapName && (
              <span className="bg-accent/10 text-accent text-xs font-mono px-3 py-1 rounded-lg border border-accent/15">
                {report.mapName}
              </span>
            )}
            {report.gameMode && (
              <span className="bg-info/10 text-info text-xs font-mono px-3 py-1 rounded-lg border border-info/15">
                {report.gameMode}
              </span>
            )}
          </div>
          <div className="mt-4 bg-bg-primary border border-border rounded-3xl overflow-hidden">
            <div className="grid xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-border">
              {topPerformanceGroups.map((group) => (
                <div key={group.title} className="p-6 text-left">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-[13px] uppercase tracking-widest text-white/65">{group.title}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${statusStyle(scoreStatus(group.overall))}`}>
                      {group.overall.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.metrics.map(([label, value]) => (
                      <div key={`${group.title}-${label}`} className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-white/70">{label}</span>
                        <span className="text-white font-mono">{formatScore(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/50 leading-relaxed">{report.overview}</p>
          <p className="mt-3 text-sm font-semibold text-white">{directSummary}</p>
          <div className="mt-5">
            <button
              type="button"
              onClick={downloadReport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-accent/25 text-accent hover:bg-accent/10 transition-colors text-sm font-semibold"
            >
              <Download className="w-4 h-4" /> Download HTML Report
            </button>
          </div>
        </div>
      </div>

      {/* Video clip review */}
      <Section title="Clip Review" icon={<PlayCircle className="w-5 h-5 text-accent" />} id="clip-review">
        <div ref={clipReviewRef} className="bg-bg-card rounded-2xl border border-border p-5">
          <video
            ref={videoRef}
            controls
            preload="metadata"
            src={getVideoUrl(jobId, accessToken)}
            className="w-full rounded-xl border border-border bg-bg-primary"
          />
          <p className="text-white/30 text-xs mt-3">
            Click any timeline moment below, then press <span className="text-accent">Watch Clip</span> to jump to that timestamp.
          </p>
          {activeMoment && (
            <div className="mt-4 bg-bg-primary rounded-xl border border-border p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1.5">
                Active Moment ({activeMoment.timestamp})
              </p>
              <p className="text-white/70 text-sm font-semibold mb-1">{activeMoment.event}</p>
              <p className="text-white/45 text-sm leading-relaxed">{activeMoment.analysis}</p>
            </div>
          )}
        </div>
      </Section>

      {/* Timeline */}
      {report.timeline?.length > 0 && (
        <Section title="Timestamp-by-Timestamp Analysis" icon={<Clock className="w-5 h-5 text-accent" />}>
          <div className="space-y-2">
            {report.timeline.map((m: any, i: number) => (
              <TimelineItem key={i} moment={m} onPlayMoment={handlePlayMoment} />
            ))}
          </div>
        </Section>
      )}

      {report.proAlternatives?.length > 0 && (
        <Section title="What a Pro Does Instead" icon={<BookCheck className="w-5 h-5 text-info" />}>
          <div className="space-y-3">
            {report.proAlternatives.map((option: any, i: number) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-3">{option.situation}</p>
                <div className="grid md:grid-cols-3 gap-2 text-xs">
                  <p className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-white/70">
                    <span className="block text-[10px] uppercase tracking-widest mb-1 text-accent">Safest</span>
                    {option.safest}
                  </p>
                  <p className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-white/70">
                    <span className="block text-[10px] uppercase tracking-widest mb-1 text-warning">Aggressive</span>
                    {option.aggressive}
                  </p>
                  <p className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-white/70">
                    <span className="block text-[10px] uppercase tracking-widest mb-1 text-info">Solo Queue</span>
                    {option.soloQueue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Top 3 Priorities */}
      {report.topThreePriorities?.length > 0 && (
        <Section title="Top 3 Priorities to Fix" icon={<AlertTriangle className="w-5 h-5 text-warning" />}>
          <div className="space-y-3">
            {report.topThreePriorities.map((p: string, i: number) => (
              <div key={i} className="flex items-start gap-5 bg-bg-card border border-warning/15 rounded-xl p-5 hover:border-warning/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-black text-warning font-mono">{i + 1}</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed pt-2">{p}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths & Mistakes */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-excellent mb-4">
            <TrendingUp className="w-5 h-5" /> Key Strengths
          </h2>
          <div className="space-y-3">
            {report.keyStrengths?.map((s: any, i: number) => (
              <div key={i} className="bg-excellent/[0.03] border border-excellent/10 rounded-xl p-5">
                <h3 className="text-excellent font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
            {(!report.keyStrengths || report.keyStrengths.length === 0) && (
              <p className="text-white/20 text-sm italic">No clear strengths identified in this VOD.</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-danger mb-4">
            <AlertTriangle className="w-5 h-5" /> Key Mistakes
          </h2>
          <div className="space-y-3">
            {report.keyMistakes?.map((m: any, i: number) => (
              <div key={i} className={`border rounded-xl p-5 ${SEVERITY_STYLES[m.severity] || "bg-bg-card border-border"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-sm">{m.title}</h3>
                  <span className="text-[10px] font-mono uppercase opacity-50">{m.severity}</span>
                </div>
                <p className="text-white/45 text-sm leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {report.srLeakingHabits?.length > 0 && (
        <Section title="Top 3 SR-Leaking Habits" icon={<AlertTriangle className="w-5 h-5 text-warning" />}>
          <div className="space-y-4">
            {report.srLeakingHabits.map((habit: any, i: number) => (
              <div key={i} className="bg-bg-card border border-warning/20 rounded-xl p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-md bg-warning/10 text-warning text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <h3 className="text-white font-semibold text-sm">{habit.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${CONFIDENCE_STYLES[habit.confidence] || "bg-bg-primary text-white/60 border border-border"}`}>
                    {confidenceLabel(habit.confidence)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/10 border border-danger/25 text-danger font-mono uppercase">
                    {habit.punishment}
                  </span>
                </div>
                <p className="text-white/65 text-sm mb-2"><span className="text-white font-semibold">Trigger:</span> {habit.trigger}</p>
                <p className="text-white/65 text-sm mb-2"><span className="text-white font-semibold">Replacement:</span> {habit.replacement}</p>
                <p className="text-white/65 text-sm"><span className="text-white font-semibold">Drill:</span> {habit.drill}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recurring Patterns */}
      {report.recurringPatterns?.length > 0 && (
        <Section title="Recurring Patterns Detected" icon={<Eye className="w-5 h-5 text-warning" />}>
          <div className="space-y-3">
            {report.recurringPatterns.map((p: any, i: number) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-white text-sm">{p.pattern}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    p.frequency === "constant" ? "bg-terrible/15 text-terrible"
                    : p.frequency === "frequent" ? "bg-bad/15 text-bad"
                    : "bg-neutral/15 text-neutral"
                  }`}>{p.frequency}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    p.impact === "high" ? "bg-terrible/15 text-terrible"
                    : p.impact === "medium" ? "bg-bad/15 text-bad"
                    : "bg-neutral/15 text-neutral"
                  }`}>{p.impact} impact</span>
                </div>
                <p className="text-white/40 text-sm">{p.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.trainingPrescription?.length > 0 && (
        <Section title="Training Prescription (Next 7 Days)" icon={<GraduationCap className="w-5 h-5 text-accent" />}>
          <div className="space-y-3">
            {report.trainingPrescription.map((goal: any, i: number) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-5">
                <p className="text-white font-semibold text-sm mb-2">{goal.title}</p>
                <p className="text-white/60 text-sm mb-1"><span className="text-white font-semibold">Cue:</span> {goal.cue}</p>
                <p className="text-white/60 text-sm mb-1"><span className="text-white font-semibold">Prescription:</span> {goal.prescription}</p>
                <p className="text-white/60 text-sm"><span className="text-white font-semibold">Target:</span> {goal.target}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Coaching Summary */}
      <Section title="Coach's Final Word" icon={<Award className="w-5 h-5 text-gold" />}>
        <div className="bg-bg-card border border-accent/15 rounded-2xl p-8 gradient-border">
          <p className="text-white/70 leading-relaxed text-[15px] whitespace-pre-line">
            {report.coachingSummary}
          </p>
        </div>
      </Section>
    </div>
  );
}
