import { readFile, writeFile } from "fs/promises";
import path from "path";
import { buildReportFromVideoAnalysis } from "../server/src/analysis/reportBuilder.js";
import { VideoAnalysisResult } from "../server/src/analysis/videoAnalyzer.js";
import { buildHtmlReport } from "../client/src/lib/html-report.js";

async function main(): Promise<void> {
  const reportPath = process.argv[2] ? path.resolve(process.argv[2]) : "";
  const coverageNote = process.argv[3]?.trim() || "";
  const coverageLabel = process.argv[4]?.trim() || "";
  if (!reportPath) throw new Error("Usage: npm run rebuild:report -- <coaching-report.json>");

  const previous = JSON.parse(await readFile(reportPath, "utf-8"));
  const mechanicalNotes: string[] = previous.mechanicalReview?.notes || [];
  const noteSplit = Math.ceil(mechanicalNotes.length / 2);
  const analysis: VideoAnalysisResult = {
    gameMode: previous.gameMode || null,
    mapName: previous.mapName || null,
    observations: previous.overview ? [previous.overview] : [],
    keyMoments: previous.timeline || [],
    aimNotes: mechanicalNotes.slice(0, noteSplit),
    movementNotes: mechanicalNotes.slice(noteSplit),
    positioningNotes: previous.positioningReview?.notes || [],
    decisionNotes: previous.decisionMakingReview?.notes || [],
    rawAnalysis: "",
  };

  const report = buildReportFromVideoAnalysis(analysis);
  if (coverageNote) {
    report.evidenceAppendix.limitations = [
      coverageNote,
      ...report.evidenceAppendix.limitations.filter((item) => item !== coverageNote),
    ];
    (report as any).coverageNote = coverageNote;
  }
  if (coverageLabel) {
    (report as any).coverageLabel = coverageLabel;
    report.coachVerdict.basedOn = `${report.timeline.length} tagged moments across ${coverageLabel} (through ${report.evidenceAppendix.sampleSize.maxTimestamp || "the final playable sequence"}).`;
  }
  const htmlPath = reportPath.replace(/\.json$/i, ".html");
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf-8");
  await writeFile(
    htmlPath,
    buildHtmlReport({ ...report, exportedAt: new Date().toISOString(), exportVersion: "1.2-full-html" }),
    "utf-8"
  );

  console.log(`Rebuilt JSON: ${reportPath}`);
  console.log(`Rebuilt HTML: ${htmlPath}`);
  console.log(`Overall rating: ${report.overallRating}/10; aim: ${report.mechanicalReview.aimQuality}/10`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
