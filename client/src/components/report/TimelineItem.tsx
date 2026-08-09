"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Crosshair, Zap, Shield, Brain, Eye, Target, Award, PlayCircle } from "lucide-react";

interface CriticalMoment {
  timestamp: string;
  event: string;
  category: string;
  rating: string;
  analysis: string;
  recommendation: string;
  confidence: string;
  perspective?: "player_pov" | "killcam_inference" | "non_playable_state";
}

const RATING_STYLES: Record<string, string> = {
  excellent: "border-excellent/30 bg-excellent/5 text-excellent",
  good: "border-good/30 bg-good/5 text-good",
  neutral: "border-neutral/30 bg-neutral/5 text-neutral",
  bad: "border-bad/30 bg-bad/5 text-bad",
  terrible: "border-terrible/30 bg-terrible/5 text-terrible",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  aim: <Crosshair className="w-4 h-4" />,
  mechanical: <Target className="w-4 h-4" />,
  movement: <Zap className="w-4 h-4" />,
  positioning: <Shield className="w-4 h-4" />,
  decision: <Brain className="w-4 h-4" />,
  awareness: <Eye className="w-4 h-4" />,
  teamplay: <Award className="w-4 h-4" />,
  objective: <Target className="w-4 h-4" />,
};

const PERSPECTIVE_STYLES: Record<string, string> = {
  player_pov: "bg-accent/10 text-accent border-accent/20",
  killcam_inference: "bg-warning/10 text-warning border-warning/20",
  non_playable_state: "bg-white/5 text-white/40 border-white/10",
};

function perspectiveLabel(value?: string): string | null {
  if (!value || value === "player_pov") return null;
  if (value === "killcam_inference") return "Killcam Inference";
  if (value === "non_playable_state") return "Non-Playable State";
  return value;
}

export default function TimelineItem({
  moment,
  onPlayMoment,
}: {
  moment: CriticalMoment;
  onPlayMoment?: (moment: CriticalMoment) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = RATING_STYLES[moment.rating] || "border-white/10 bg-bg-card text-white/60";
  const sourceLabel = perspectiveLabel(moment.perspective);

  return (
    <div
      className={`border rounded-xl overflow-hidden cursor-pointer transition-all hover:bg-bg-card-hover ${style}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs font-bold bg-bg-primary/80 px-2.5 py-1 rounded-lg flex-shrink-0">
            {moment.timestamp}
          </span>
          <span className="flex-shrink-0">{CATEGORY_ICONS[moment.category]}</span>
          <span className="font-medium text-sm truncate">{moment.event}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          {sourceLabel && (
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${PERSPECTIVE_STYLES[moment.perspective || ""] || "bg-white/5 text-white/40 border-white/10"}`}>
              {sourceLabel}
            </span>
          )}
          {moment.confidence !== "high" && (
            <span className="text-[10px] text-white/20 font-mono uppercase">{moment.confidence}</span>
          )}
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-bg-primary/50">
            {moment.rating}
          </span>
          {open ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5 space-y-3">
          {sourceLabel && (
            <div className="pt-3">
              <span className={`inline-flex text-[10px] font-mono uppercase px-2 py-1 rounded border ${PERSPECTIVE_STYLES[moment.perspective || ""] || "bg-white/5 text-white/40 border-white/10"}`}>
                Source: {sourceLabel}
              </span>
            </div>
          )}
          <p className="text-white/70 text-sm leading-relaxed pt-3">{moment.analysis}</p>
          {onPlayMoment && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlayMoment(moment);
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-accent/25 text-accent hover:bg-accent/10 transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Watch Clip
            </button>
          )}
          {moment.recommendation && (
            <div className="bg-bg-primary rounded-xl p-4">
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1.5">
                What You Should Do
              </p>
              <p className="text-white/60 text-sm leading-relaxed">{moment.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
