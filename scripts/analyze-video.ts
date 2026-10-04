import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { analyzeVideo } from "../server/src/analysis/videoAnalyzer.js";
import { buildReportFromVideoAnalysis } from "../server/src/analysis/reportBuilder.js";
import { buildHtmlReport } from "../client/src/lib/html-report.js";

async function main(): Promise<void> {
  const videoPath = process.argv[2] ? path.resolve(process.argv[2]) : "";
  const outputDir = path.resolve(process.argv[3] || "output");

  if (!videoPath) {
    throw new Error("Usage: npm run analyze:video -- <video-path> [output-directory]");
  }

  await mkdir(outputDir, { recursive: true });
  const analysis = await analyzeVideo(videoPath);
  const report = buildReportFromVideoAnalysis(analysis);
  const baseName = path.basename(videoPath, path.extname(videoPath)).replace(/[^a-zA-Z0-9-_]+/g, "-");
  const jsonPath = path.join(outputDir, `${baseName}-coaching-report.json`);
  const htmlPath = path.join(outputDir, `${baseName}-coaching-report.html`);
  const analysisPath = path.join(outputDir, `${baseName}-source-analysis.json`);

  await writeFile(analysisPath, JSON.stringify(analysis, null, 2), "utf-8");
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  await writeFile(
    htmlPath,
    buildHtmlReport({
      ...report,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.2-full-html",
    }),
    "utf-8"
  );

  console.log(`Source analysis: ${analysisPath}`);
  console.log(`Report JSON: ${jsonPath}`);
  console.log(`Report HTML: ${htmlPath}`);
  console.log(`Timeline moments: ${report.timeline.length}`);
  console.log(`Overall rating: ${report.overallRating}/10`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
