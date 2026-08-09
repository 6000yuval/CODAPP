"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAnalysisStatus } from "@/hooks/useAnalysisStatus";
import { AlertCircle, ArrowLeft, Loader2, Crosshair, Brain, BarChart3 } from "lucide-react";
import CoachingReport from "@/components/report/CoachingReport";
import { storeJobAccessToken } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Crosshair; color: string }> = {
  loading: { label: "Connecting to server...", icon: Loader2, color: "text-white/40" },
  queued: { label: "Queued for analysis...", icon: Loader2, color: "text-white/40" },
  analyzing: { label: "AI is watching your full gameplay...", icon: Brain, color: "text-accent" },
  aggregating: { label: "Generating coaching report...", icon: BarChart3, color: "text-gold" },
};

const PIPELINE_STEPS = [
  { key: "upload", label: "Uploaded", threshold: 0 },
  { key: "analyze", label: "Video Analysis", threshold: 10 },
  { key: "report", label: "Report Generation", threshold: 70 },
  { key: "done", label: "Complete", threshold: 95 },
];

export default function AnalysisClient({ jobId }: { jobId: string }) {
  const searchParams = useSearchParams();
  const accessTokenFromUrl = searchParams.get("token") || undefined;

  useEffect(() => {
    if (accessTokenFromUrl) {
      storeJobAccessToken(jobId, accessTokenFromUrl);
    }
  }, [accessTokenFromUrl, jobId]);

  const { status, progress, report, error } = useAnalysisStatus(jobId, accessTokenFromUrl);

  // Report complete — show the full coaching report
  if (status === "complete" && report) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 text-white/30 hover:text-accent text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Analyze another VOD
        </Link>
        <CoachingReport report={report} jobId={jobId} accessToken={accessTokenFromUrl} />
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="max-w-lg mx-auto px-6 py-32 text-center">
        <div className="w-20 h-20 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-9 h-9 text-danger" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Analysis Failed</h2>
        <p className="text-white/40 mb-8 leading-relaxed">{error || "Something went wrong during analysis."}</p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-dim transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Try Again
        </Link>
      </div>
    );
  }

  // Loading / in-progress state
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.loading;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <div className="text-center">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-accent/5 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="relative w-24 h-24 rounded-full bg-bg-card border border-accent/20 flex items-center justify-center animate-pulse-glow">
            <StatusIcon className={`w-10 h-10 ${statusConfig.color} ${status !== "complete" ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{statusConfig.label}</h2>
        <p className="text-white/30 text-sm mb-10">
          {status === "analyzing"
            ? "The AI coach is reviewing your full gameplay video. This is the longest step."
            : "This typically takes 1-3 minutes depending on video length."}
        </p>

        {/* Progress bar */}
        <div className="relative w-full h-4 bg-bg-secondary rounded-full overflow-hidden border border-border mb-3">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent/80 to-accent rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 animate-shimmer rounded-full" />
        </div>
        <p className="text-white/25 text-sm font-mono mb-12">{progress}%</p>

        {/* Pipeline steps */}
        <div className="flex justify-between">
          {PIPELINE_STEPS.map(({ key, label, threshold }, i) => {
            const isActive = progress >= threshold;
            const isCurrent =
              progress >= threshold &&
              (i === PIPELINE_STEPS.length - 1 || progress < PIPELINE_STEPS[i + 1].threshold);

            return (
              <div key={key} className="flex flex-col items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                    isCurrent
                      ? "border-accent text-accent bg-accent/10 animate-pulse-glow"
                      : isActive
                      ? "border-accent/30 text-accent/60 bg-accent/5"
                      : "border-white/10 text-white/15 bg-bg-card"
                  }`}
                >
                  {isActive && !isCurrent ? (
                    <Crosshair className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCurrent ? "text-accent" : isActive ? "text-white/40" : "text-white/15"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
