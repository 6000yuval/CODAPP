"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, AlertCircle, Film, Crosshair, CheckCircle2,
  MonitorPlay, HardDrive, Clock
} from "lucide-react";
import { storeJobAccessToken, uploadVideo } from "@/lib/api";

const ACCEPTED_TYPES = [
  "video/mp4", "video/webm", "video/quicktime",
  "video/x-msvideo", "video/x-matroska",
];

export default function UploadClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputId = "file-input";

  const openFilePicker = useCallback(() => {
    if (uploading) return;
    document.getElementById(fileInputId)?.click();
  }, [uploading]);

  const parseUploadError = useCallback((err: unknown): string => {
    const response = (err as { response?: { data?: unknown } })?.response;
    const payload = response?.data;

    if (payload && typeof payload === "object" && "error" in payload) {
      const apiError = (payload as { error?: unknown }).error;
      if (typeof apiError === "string" && apiError.trim()) {
        return apiError.trim();
      }
    }

    if (typeof payload === "string" && payload.trim()) {
      const withoutTags = payload.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const unsupported = withoutTags.match(/Unsupported file (type|extension):[^.]+\./i);
      if (unsupported) return unsupported[0];
      const sizeError = withoutTags.match(/Maximum upload size is [^.]+\./i);
      if (sizeError) return sizeError[0];
      if (withoutTags.length > 0 && withoutTags.length < 180) return withoutTags;
    }

    return "Upload failed. Check your connection and try again.";
  }, []);

  const validateFile = useCallback((f: File): string | null => {
    if (
      !ACCEPTED_TYPES.includes(f.type) &&
      !f.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)
    ) {
      return "Unsupported format. Use MP4, WebM, MOV, AVI, or MKV.";
    }
    if (f.size > 512 * 1024 * 1024) {
      return "File too large. Maximum is 512MB.";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setFile(f);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const result = await uploadVideo(file, setUploadProgress);
      storeJobAccessToken(result.jobId, result.accessToken);
      router.push(`/analysis/${result.jobId}?token=${encodeURIComponent(result.accessToken)}`);
    } catch (err: unknown) {
      setError(parseUploadError(err));
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-accent/5 border border-accent/15 rounded-full px-4 py-1.5 mb-6">
          <MonitorPlay className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-accent/80">Upload & Analyze</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
          Upload Your <span className="text-accent">Gameplay</span>
        </h1>
        <p className="text-white/40 max-w-lg mx-auto">
          Drop your Black Ops 7 VOD below. We&apos;ll analyze the full video and run a
          full competitive analysis on your gameplay.
        </p>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: Clock, label: "Max 15 minutes" },
          { icon: HardDrive, label: "Max 512MB" },
          { icon: Film, label: "MP4, MOV, WebM" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2 bg-bg-card border border-border rounded-xl py-3 px-4"
          >
            <Icon className="w-4 h-4 text-white/25" />
            <span className="text-xs text-white/40 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/5"
            : file
            ? "border-accent/40 bg-accent/[0.03]"
            : "border-white/10 bg-bg-card hover:border-white/20 hover:bg-bg-card-hover"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          id={fileInputId}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.avi,.mkv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {!file ? (
          <div className="animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-5">
              <Upload className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/60 text-lg font-semibold mb-2">
              Drop your gameplay video here
            </p>
            <p className="text-white/25 text-sm">
              or click to browse files
            </p>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-accent" />
            </div>
            <p className="text-white font-bold text-lg mb-1">{file.name}</p>
            <p className="text-white/35 text-sm mb-1">{formatSize(file.size)}</p>
            <p className="text-white/15 text-xs mt-3">Click to change file</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-5 py-4">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-danger/80 text-sm">{error}</p>
        </div>
      )}

      {/* Upload button / progress */}
      {file && (
        <div className="mt-6">
          {uploading ? (
            <div className="animate-fade-in-up">
              <div className="w-full bg-bg-secondary rounded-full h-3 overflow-hidden border border-border">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-white/30 text-sm mt-3 font-mono">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUpload}
              className="w-full flex items-center justify-center gap-3 py-4 bg-accent text-bg-primary font-bold text-lg rounded-xl hover:bg-accent-dim transition-all animate-pulse-glow"
            >
              <Crosshair className="w-5 h-5" />
              Analyze My Gameplay
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-10 bg-bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 mb-3">
          Tips for Best Results
        </h3>
        <ul className="space-y-2 text-xs text-white/30">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent/50 flex-shrink-0 mt-0.5" />
            Upload 1080p or higher resolution footage
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent/50 flex-shrink-0 mt-0.5" />
            Make sure the full HUD is visible (minimap, killstreak bar, ammo count)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent/50 flex-shrink-0 mt-0.5" />
            Upload a full game if possible - patterns are more visible over a full match
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent/50 flex-shrink-0 mt-0.5" />
            Standard gameplay works best - avoid heavily edited or montage clips
          </li>
        </ul>
      </div>
    </div>
  );
}

