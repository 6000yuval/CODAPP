import { Router, Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { access, stat } from "fs/promises";
import { createHash } from "crypto";
import { createReadStream } from "fs";
import { Job } from "../types/report.js";
import { createJob, findCompletedJobByVideoHash, getAllJobs, getJob, setJobComplete, updateJob } from "../store/jobStore.js";
import { runAnalysisPipeline } from "../analysis/pipeline.js";

const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512MB
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
const ALLOWED_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "application/octet-stream",
]);
const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".avi", ".mkv"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = ALLOWED_MIME_TYPES.has(file.mimetype);
    const extensionAllowed = ALLOWED_EXTENSIONS.has(ext);

    if (mimeAllowed && extensionAllowed) {
      cb(null, true);
    } else if (!extensionAllowed) {
      cb(new Error(`Unsupported file extension: ${ext || "unknown"}. Use MP4, WebM, MOV, AVI, or MKV.`));
    } else if (!mimeAllowed) {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use MP4, WebM, MOV, AVI, or MKV.`));
    } else {
      cb(new Error("Unsupported upload."));
    }
  },
});

const router = Router();

async function hashFile(filePath: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function findReusableJobByVideoHash(videoHash: string): Promise<Job | undefined> {
  const directMatch = findCompletedJobByVideoHash(videoHash);
  if (isReusableReport(directMatch)) return directMatch;

  const completedJobs = getAllJobs()
    .filter((job) => isReusableReport(job))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  for (const job of completedJobs) {
    if (job.videoHash) continue;

    try {
      await access(job.videoPath);
      const existingHash = await hashFile(job.videoPath);
      updateJob(job.id, { videoHash: existingHash });
      if (existingHash === videoHash) {
        return getJob(job.id);
      }
    } catch {
      // Ignore missing historical files or backfill failures.
    }
  }

  return undefined;
}

function isReusableReport(job: Job | undefined): job is Job & { report: NonNullable<Job["report"]> } {
  return !!(
    job?.status === "complete" &&
    job.report &&
    Array.isArray(job.report.timeline) &&
    job.report.timeline.length > 0
  );
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

function getRequestToken(req: Request): string | null {
  const queryToken = req.query.token;
  if (typeof queryToken === "string" && queryToken.trim()) return queryToken.trim();
  const headerToken = req.headers["x-job-token"];
  if (typeof headerToken === "string" && headerToken.trim()) return headerToken.trim();
  return null;
}

function getAuthorizedJob(req: Request, res: Response): Job | null {
  const job = getJob(req.params.jobId as string);
  if (!job) {
    res.status(404).json({ error: "Job not found." });
    return null;
  }

  const requestToken = getRequestToken(req);
  if (!requestToken || requestToken !== job.accessToken) {
    res.status(403).json({ error: "Invalid or missing access token." });
    return null;
  }

  return job;
}

// POST /api/analysis/upload
router.post("/upload", (req: Request, res: Response) => {
  upload.single("video")(req, res, (err?: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "File too large. Maximum upload size is 512MB." });
        return;
      }
      res.status(400).json({ error: err.message || "Upload failed." });
      return;
    }

    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }

    (async () => {
      if (!req.file) {
        res.status(400).json({ error: "No video file provided." });
        return;
      }

      const videoHash = await hashFile(req.file.path);
      const jobId = uuidv4();
      const accessToken = uuidv4();
      createJob(jobId, req.file.path, accessToken, videoHash);

      const cachedJob = await findReusableJobByVideoHash(videoHash);
      if (cachedJob?.report) {
        setJobComplete(jobId, cachedJob.report);
        res.json({ jobId, status: "complete", accessToken, reusedAnalysis: true });
        return;
      }

      // Fire and forget - analysis runs in the background.
      runAnalysisPipeline(jobId, req.file.path);

      res.json({ jobId, status: "queued", accessToken });
    })().catch((unexpected) => {
      const message = unexpected instanceof Error ? unexpected.message : "Upload failed";
      res.status(500).json({ error: message });
    });
  });
});

// GET /api/analysis/status/:jobId
router.get("/status/:jobId", (req: Request, res: Response) => {
  const job = getAuthorizedJob(req, res);
  if (!job) return;

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    error: job.error || null,
    hasReport: !!job.report,
  });
});

// GET /api/analysis/report/:jobId
router.get("/report/:jobId", (req: Request, res: Response) => {
  const job = getAuthorizedJob(req, res);
  if (!job) return;

  if (job.status !== "complete" || !job.report) {
    res.status(202).json({ status: job.status, progress: job.progress });
    return;
  }

  res.json(job.report);
});

// GET /api/analysis/video/:jobId
router.get("/video/:jobId", async (req: Request, res: Response) => {
  const job = getAuthorizedJob(req, res);
  if (!job) return;

  const absolutePath = path.resolve(ROOT_DIR, job.videoPath);

  try {
    const fileStats = await stat(absolutePath);
    const total = fileStats.size;
    const mimeType = getMimeType(absolutePath);
    const range = req.headers.range;

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Accept-Ranges", "bytes");

    if (req.method === "HEAD") {
      res.setHeader("Content-Length", total);
      res.status(200).end();
      return;
    }

    if (!range) {
      res.setHeader("Content-Length", total);
      createReadStream(absolutePath).pipe(res);
      return;
    }

    const match = /bytes=(\d+)-(\d*)/.exec(range);
    if (!match) {
      res.status(416).json({ error: "Invalid range header." });
      return;
    }

    const start = Number.parseInt(match[1], 10);
    const requestedEnd = match[2] ? Number.parseInt(match[2], 10) : total - 1;
    const end = Math.min(requestedEnd, total - 1);

    if (start >= total || end < start) {
      res.status(416).json({ error: "Requested range not satisfiable." });
      return;
    }

    const chunkSize = end - start + 1;
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
    res.setHeader("Content-Length", chunkSize);

    createReadStream(absolutePath, { start, end }).pipe(res);
  } catch {
    res.status(404).json({ error: "Video not available." });
  }
});

export default router;
