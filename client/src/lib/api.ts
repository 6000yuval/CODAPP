import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const api = axios.create({ baseURL: apiBaseUrl });
const TOKEN_KEY_PREFIX = "analysis_token:";
const MAX_UPLOAD_BYTES = 512 * 1024 * 1024;

export interface UploadResponse {
  jobId: string;
  status: string;
  accessToken: string;
}

export interface JobStatus {
  id: string;
  status: "queued" | "extracting_frames" | "analyzing" | "aggregating" | "complete" | "error";
  progress: number;
  error: string | null;
  hasReport: boolean;
}

function tokenKey(jobId: string): string {
  return `${TOKEN_KEY_PREFIX}${jobId}`;
}

export function storeJobAccessToken(jobId: string, accessToken: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(tokenKey(jobId), accessToken);
}

export function getStoredJobAccessToken(jobId: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(tokenKey(jobId));
}

function resolveToken(jobId: string, explicitToken?: string): string | null {
  if (explicitToken && explicitToken.trim()) return explicitToken;
  return getStoredJobAccessToken(jobId);
}

export async function uploadVideo(
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("video", file);

  const { data } = await api.post<UploadResponse>("/analysis/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    maxBodyLength: MAX_UPLOAD_BYTES,
    maxContentLength: MAX_UPLOAD_BYTES,
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  return data;
}

export async function getJobStatus(jobId: string, accessToken?: string): Promise<JobStatus> {
  const token = resolveToken(jobId, accessToken);
  const { data } = await api.get<JobStatus>(`/analysis/status/${jobId}`, {
    params: { token: token || undefined },
    headers: token ? { "x-job-token": token } : undefined,
  });
  return data;
}

export async function getReport(jobId: string, accessToken?: string) {
  const token = resolveToken(jobId, accessToken);
  const { data } = await api.get(`/analysis/report/${jobId}`, {
    params: { token: token || undefined },
    headers: token ? { "x-job-token": token } : undefined,
  });
  return data;
}

export function getVideoUrl(jobId: string, accessToken?: string): string {
  const token = resolveToken(jobId, accessToken);
  const base = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const url = `${base}/analysis/video/${encodeURIComponent(jobId)}`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}
