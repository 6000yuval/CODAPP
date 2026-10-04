import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Job, CoachingReport } from "../types/report.js";

interface PersistedJob extends Omit<Job, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

const jobs = new Map<string, Job>();
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DATA_DIR = path.resolve(ROOT_DIR, "data");
const JOB_STORE_FILE = path.join(DATA_DIR, "jobs.json");

function resolveVideoPath(videoPath: string): string {
  if (path.isAbsolute(videoPath)) return videoPath;
  return path.resolve(ROOT_DIR, videoPath);
}

function reviveJob(raw: PersistedJob): Job {
  const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const updatedAt = raw.updatedAt ? new Date(raw.updatedAt) : createdAt;
  return {
    ...raw,
    accessToken: raw.accessToken || raw.id,
    createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
    updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
  };
}

function persistJobs(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const payload: PersistedJob[] = Array.from(jobs.values()).map((job) => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }));
  writeFileSync(JOB_STORE_FILE, JSON.stringify(payload, null, 2), "utf-8");
}

function loadJobs(): void {
  try {
    if (!existsSync(JOB_STORE_FILE)) return;
    const raw = readFileSync(JOB_STORE_FILE, "utf-8");
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw) as PersistedJob[];
    for (const item of parsed) {
      const job = reviveJob(item);
      jobs.set(job.id, job);
    }
  } catch (err) {
    console.error("[jobStore] Failed loading persisted jobs:", err);
  }
}

loadJobs();

export function createJob(id: string, videoPath: string, accessToken: string, videoHash?: string): Job {
  const now = new Date();
  const job: Job = {
    id,
    accessToken,
    status: "queued",
    progress: 0,
    videoPath,
    videoHash,
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(id, job);
  persistJobs();
  return job;
}

export function findCompletedJobByVideoHash(videoHash: string): Job | undefined {
  return Array.from(jobs.values())
    .filter(
      (job) =>
        job.status === "complete" &&
        !!job.report &&
        Array.isArray(job.report.timeline) &&
        job.report.timeline.length > 0 &&
        job.videoHash === videoHash
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values());
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  Object.assign(job, updates, { updatedAt: new Date() });
  persistJobs();
  return job;
}

export function setJobComplete(id: string, report: CoachingReport): void {
  updateJob(id, { status: "complete", progress: 100, report, error: undefined });
}

export function setJobError(id: string, error: string): void {
  updateJob(id, { status: "error", error });
}

export async function cleanupExpiredJobs(retentionHours: number): Promise<number> {
  const now = Date.now();
  const ttlMs = Math.max(1, retentionHours) * 60 * 60 * 1000;
  const expired = Array.from(jobs.values()).filter((job) => now - job.createdAt.getTime() > ttlMs);
  if (expired.length === 0) return 0;

  for (const job of expired) {
    jobs.delete(job.id);
    const absolutePath = resolveVideoPath(job.videoPath);
    try {
      await unlink(absolutePath);
    } catch {
      // Ignore missing files or filesystem cleanup errors.
    }
  }

  persistJobs();
  return expired.length;
}
