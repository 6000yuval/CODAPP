"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getJobStatus, getReport, type JobStatus } from "@/lib/api";

interface AnalysisState {
  status: JobStatus["status"] | "loading";
  progress: number;
  report: unknown | null;
  error: string | null;
}

export function useAnalysisStatus(jobId: string, accessToken?: string): AnalysisState {
  const [state, setState] = useState<AnalysisState>({
    status: "loading",
    progress: 0,
    report: null,
    error: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const status = await getJobStatus(jobId, accessToken);
      setState((prev) => ({
        ...prev,
        status: status.status,
        progress: status.progress,
        error: status.error,
      }));

      if (status.status === "complete") {
        const report = await getReport(jobId, accessToken);
        setState((prev) => ({ ...prev, report }));
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else if (status.status === "error") {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (err: unknown) {
      const httpError = err as { response?: { status?: number; data?: { error?: string } } };
      const isForbidden = httpError?.response?.status === 403;
      const apiMessage = httpError?.response?.data?.error;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: isForbidden
          ? "Missing or invalid analysis access token."
          : apiMessage || "Lost connection to server.",
      }));
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [accessToken, jobId]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  return state;
}
