/* eslint-disable @typescript-eslint/no-explicit-any */

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function formatScore(value: unknown): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const score = Number(value);
  return Number.isFinite(score) ? `${score.toFixed(1)}/10` : "N/A";
}

function scoreStatus(score: number): "strong" | "ok" | "weak" {
  if (score >= 7) return "strong";
  if (score >= 5) return "ok";
  return "weak";
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
  if (decision === "weak") return "Your mechanics are playable, but your fight decisions are leaking SR.";
  if (positioning === "weak") return "Your aim is fine, but your positioning is too punishable.";
  return "Your game is balanced overall, but you still need cleaner, lower-risk reps.";
}

function list(items: unknown[]): string {
  return (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function detailList(items: any[], empty: string): string {
  if (!items?.length) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return items
    .map(
      (item) => `<div class="subcard">
        <div class="row"><strong>${escapeHtml(item.title)}</strong>${item.severity ? `<span class="pill">${escapeHtml(item.severity)}</span>` : ""}</div>
        <p>${escapeHtml(item.description)}</p>
      </div>`
    )
    .join("");
}

export function buildHtmlReport(report: any): string {
  const timelineRows = (report.timeline || [])
    .map(
      (moment: any) => `<div class="subcard">
        <div class="row">
          <span class="timestamp">${escapeHtml(moment.timestamp)}</span>
          <strong>${escapeHtml(moment.event)}</strong>
          <span class="pill">${escapeHtml(moment.category)}</span>
          <span class="pill rating-${escapeHtml(moment.rating)}">${escapeHtml(moment.rating)}</span>
          <span class="pill">${escapeHtml(moment.confidence || "unknown")}</span>
          ${moment.perspective !== "player_pov" ? `<span class="pill">${escapeHtml(moment.perspective)}</span>` : ""}
        </div>
        <p>${escapeHtml(moment.analysis)}</p>
        ${moment.recommendation ? `<p><strong>Coach it:</strong> ${escapeHtml(moment.recommendation)}</p>` : ""}
      </div>`
    )
    .join("");

  const habitRows = (report.srLeakingHabits || [])
    .map(
      (habit: any, index: number) => `<div class="subcard">
        <div class="row">
          <strong>${index + 1}. ${escapeHtml(habit.name)}</strong>
          <span class="pill">${escapeHtml(habit.punishment || "ranked")}</span>
          <span class="pill">${escapeHtml(habit.confidence || "unknown")}</span>
        </div>
        <p><strong>Trigger:</strong> ${escapeHtml(habit.trigger)}</p>
        <p><strong>Replacement:</strong> ${escapeHtml(habit.replacement)}</p>
        <p><strong>Drill:</strong> ${escapeHtml(habit.drill)}</p>
        ${habit.evidence?.length ? `<p class="muted"><strong>Evidence:</strong> ${escapeHtml(habit.evidence.join("; "))}</p>` : ""}
      </div>`
    )
    .join("");

  const metricGroups = [
    {
      title: "Aim & Movement",
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
      ],
    },
  ];

  const metricHtml = metricGroups
    .map(
      (group) => `<div class="card"><h3>${escapeHtml(group.title)}</h3>${group.metrics
        .map(([label, value]) => `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatScore(value))}</strong></div>`)
        .join("")}</div>`
    )
    .join("");

  const scorecards = (report.scorecards || [])
    .map(
      (metric: any) => `<tr>
        <td>${escapeHtml(metric.label)}</td>
        <td>${escapeHtml(formatScore(metric.score))}</td>
        <td>${escapeHtml(metric.observations)}</td>
        <td>${escapeHtml(metric.confidence)}</td>
        <td>${escapeHtml(metric.reason || "")}</td>
      </tr>`
    )
    .join("");

  const patterns = (report.recurringPatterns || [])
    .map((pattern: any) => `<div class="subcard"><div class="row"><strong>${escapeHtml(pattern.pattern)}</strong><span class="pill">${escapeHtml(pattern.frequency)}</span><span class="pill">${escapeHtml(pattern.impact)} impact</span></div><p>${escapeHtml(pattern.description)}</p></div>`)
    .join("");

  const alternatives = (report.proAlternatives || [])
    .map((option: any) => `<div class="subcard"><strong>${escapeHtml(option.situation)}</strong><div class="three"><p><span class="eyebrow">Safest</span>${escapeHtml(option.safest)}</p><p><span class="eyebrow">Aggressive</span>${escapeHtml(option.aggressive)}</p><p><span class="eyebrow">Solo queue</span>${escapeHtml(option.soloQueue)}</p></div></div>`)
    .join("");

  const training = (report.trainingPrescription || [])
    .map((goal: any) => `<div class="subcard"><div class="row"><strong>${escapeHtml(goal.title)}</strong><span class="pill">${escapeHtml(goal.cue)}</span></div><p>${escapeHtml(goal.prescription)}</p><p><strong>Target:</strong> ${escapeHtml(goal.target)}</p></div>`)
    .join("");

  const notes = [
    ["Aim & movement notes", report.mechanicalReview?.notes],
    ["Positioning notes", report.positioningReview?.notes],
    ["Decision notes", report.decisionMakingReview?.notes],
    ["Over-challenges", report.decisionMakingReview?.overChallenges],
    ["Ego challenges", report.decisionMakingReview?.egoChalls],
    ["Bad peeks", report.decisionMakingReview?.badPeeks],
  ]
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .map(([title, values]) => `<div class="card"><h3>${escapeHtml(title)}</h3><ul>${list(values as unknown[])}</ul></div>`)
    .join("");

  const evidence = report.evidenceAppendix || {};
  const sample = evidence.sampleSize || {};
  const aimScore = Number(report?.mechanicalReview?.aimQuality ?? report?.overallRating ?? 5);
  const positioningScore = Number(report?.positioningReview?.mapAwareness ?? report?.overallRating ?? 5);
  const decisionScore = Number(report?.decisionMakingReview?.engagementSelection ?? report?.overallRating ?? 5);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Full VOD Coaching Report - ${escapeHtml(report.mapName || "Gameplay")}</title>
  <style>
    :root { color-scheme: dark; --bg:#080d1a; --card:#111831; --sub:#0c1328; --border:#29365d; --text:#e5e7eb; --muted:#9aa6bf; --accent:#4ade80; --warn:#fbbf24; --bad:#fb7185; }
    * { box-sizing: border-box; }
    body { max-width: 1180px; margin: 0 auto; padding: 28px; font: 15px/1.55 Inter, ui-sans-serif, system-ui, Arial, sans-serif; color: var(--text); background: var(--bg); }
    h1,h2,h3 { color:#fff; line-height:1.2; } h1 { margin-bottom:6px; } h2 { margin-top:0; font-size:20px; } h3 { margin-top:0; font-size:16px; }
    .hero,.card,.section { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px; margin:14px 0; }
    .section { padding:20px; } .subcard { background:var(--sub); border:1px solid var(--border); border-radius:10px; padding:14px; margin:10px 0; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(275px,1fr)); gap:12px; }
    .three { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:10px; } .three p { margin:0; background:#111a34; border-radius:8px; padding:10px; }
    .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:8px; }
    .pill,.timestamp { font-size:12px; background:#1d2a50; padding:3px 8px; border-radius:999px; border:1px solid #3a4a78; }
    .timestamp { color:var(--accent); font-weight:800; } .rating-excellent,.rating-good { color:var(--accent); } .rating-bad,.rating-terrible { color:var(--bad); }
    .score { color:var(--accent); font-size:34px; font-weight:900; } .meta,.muted { color:var(--muted); } .pre { white-space:pre-line; }
    .metric { display:flex; justify-content:space-between; gap:16px; padding:7px 0; border-bottom:1px solid #202b4a; } .metric:last-child { border:0; }
    .eyebrow { display:block; color:var(--accent); text-transform:uppercase; letter-spacing:.08em; font-size:10px; font-weight:800; margin-bottom:5px; }
    table { width:100%; border-collapse:collapse; } th,td { text-align:left; border-bottom:1px solid var(--border); padding:9px 8px; vertical-align:top; } th { color:#fff; }
    ul { padding-left:20px; } li { margin:5px 0; } p { margin:7px 0; }
    @media (max-width:720px) { body { padding:14px; } .three { grid-template-columns:1fr; } table { font-size:12px; } }
    @media print { body { max-width:none; background:#fff; color:#111827; } .hero,.card,.section,.subcard { break-inside:avoid; background:#fff; border-color:#cbd5e1; } h1,h2,h3,strong { color:#111827; } .meta,.muted { color:#475569; } }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Full Pro VOD Coaching Review</h1>
    <p class="meta"><strong>Map:</strong> ${escapeHtml(report.mapName || "Unknown")} · <strong>Mode:</strong> ${escapeHtml(report.gameMode || "Unknown")} · <strong>Scope:</strong> ${escapeHtml(report.coverageLabel || report.coachVerdict?.scope || sample.scope || "unknown")}</p>
    <div class="score">${escapeHtml(formatScore(report.overallRating))}</div>
    <p>${escapeHtml(report.overview)}</p>
    <p><strong>${escapeHtml(buildDirectSummary(aimScore, positioningScore, decisionScore))}</strong></p>
    <p class="muted">${escapeHtml(report.coachVerdict?.basedOn || "")}</p>
    ${report.coverageNote ? `<p class="muted"><strong>Recording coverage:</strong> ${escapeHtml(report.coverageNote)}</p>` : ""}
  </div>

  <div class="grid">${metricHtml}</div>

  <section class="section"><h2>Evidence-Gated Scorecard</h2><div style="overflow-x:auto"><table><thead><tr><th>Metric</th><th>Score</th><th>Observations</th><th>Confidence</th><th>Qualification</th></tr></thead><tbody>${scorecards}</tbody></table></div></section>

  <div class="grid">
    <section class="section"><h2>Top Priorities</h2><ol>${(report.topThreePriorities || []).map((item: unknown) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>
    <section class="section"><h2>Coach Verdict</h2><p><strong>${escapeHtml(report.coachVerdict?.verdict)}</strong></p><p><strong>Bottleneck:</strong> ${escapeHtml(report.coachVerdict?.bottleneck)}</p><p class="muted">Confidence: ${escapeHtml(report.coachVerdict?.confidence)}</p></section>
  </div>

  <div class="grid">
    <section class="section"><h2>Key Strengths</h2>${detailList(report.keyStrengths || [], "No clear strengths extracted.")}</section>
    <section class="section"><h2>Key Mistakes</h2>${detailList(report.keyMistakes || [], "No high-confidence mistakes extracted.")}</section>
  </div>

  <section class="section"><h2>Timestamp-by-Timestamp Analysis</h2>${timelineRows || "<p>No timeline entries.</p>"}</section>
  <section class="section"><h2>Top SR-Leaking Habits</h2>${habitRows || "<p>No repeated habit leaks extracted.</p>"}</section>
  <section class="section"><h2>Recurring Patterns</h2>${patterns || "<p>No recurring pattern met the evidence threshold.</p>"}</section>
  <section class="section"><h2>What a Pro Does Instead</h2>${alternatives || "<p>No alternatives extracted.</p>"}</section>
  <section class="section"><h2>Training Prescription</h2>${training || "<p>No training plan extracted.</p>"}</section>

  <div class="grid">${notes}</div>

  <section class="section">
    <h2>Evidence & Limitations</h2>
    <div class="grid">
      <div><h3>Observed facts</h3><ul>${list(evidence.observedFacts || [])}</ul></div>
      <div><h3>Coach inferences</h3><ul>${list(evidence.inferences || [])}</ul></div>
      <div><h3>Non-playable / killcam evidence</h3><ul>${list(evidence.nonPlayableStateEvidence || [])}</ul></div>
      <div><h3>Limitations</h3><ul>${list(evidence.limitations || [])}</ul></div>
    </div>
    <p class="muted"><strong>Sample:</strong> ${escapeHtml(sample.timelineMoments ?? report.timeline?.length ?? 0)} tagged moments; latest evidence ${escapeHtml(sample.maxTimestamp || "N/A")}.</p>
  </section>

  <section class="section"><h2>Coach's Final Word</h2><p class="pre">${escapeHtml(report.coachingSummary || "")}</p></section>
  <p class="meta">Exported ${escapeHtml(report.exportedAt || new Date().toISOString())} · ${escapeHtml(report.exportVersion || "1.2-full-html")}</p>
</body>
</html>`;
}
