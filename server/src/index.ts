import "dotenv/config";
import express from "express";
import cors from "cors";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import analysisRouter from "./routes/analysis.js";
import { cleanupExpiredJobs } from "./store/jobStore.js";

const PORT = process.env.PORT || 3001;
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
const VIDEO_RETENTION_HOURS = Number.parseInt(process.env.VIDEO_RETENTION_HOURS || "24", 10);
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
const DATA_DIR = path.join(ROOT_DIR, "data");

async function main() {
  await mkdir(UPLOADS_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/analysis", analysisRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "BO7 VOD Analyzer" });
  });

  const removedAtStart = await cleanupExpiredJobs(VIDEO_RETENTION_HOURS);
  if (removedAtStart > 0) {
    console.log(`[cleanup] Removed ${removedAtStart} expired jobs/videos.`);
  }

  setInterval(async () => {
    const removed = await cleanupExpiredJobs(VIDEO_RETENTION_HOURS);
    if (removed > 0) {
      console.log(`[cleanup] Removed ${removed} expired jobs/videos.`);
    }
  }, CLEANUP_INTERVAL_MS);

  app.listen(PORT, () => {
    console.log(`\nBO7 VOD Analyzer API running on http://localhost:${PORT}`);
    console.log(`  Video + report analysis: Gemini (${process.env.GEMINI_MODEL || "gemini-2.5-flash"})`);
    console.log(`  Retention: ${VIDEO_RETENTION_HOURS}h`);
    console.log("  Upload endpoint: POST /api/analysis/upload\n");
  });
}

main().catch(console.error);
