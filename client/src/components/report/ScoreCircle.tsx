"use client";

interface Props {
  score: number;
  size?: number;
}

export default function ScoreCircle({ score, size = 150 }: Props) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = (score / 10) * circumference;
  const offset = circumference - fillPercent;

  const color =
    score >= 8 ? "#00ff41" : score >= 6 ? "#7dff7d" : score >= 4 ? "#ffcc00" : score >= 2 ? "#ff8c00" : "#ff3b3b";

  const label =
    score >= 9 ? "ELITE" : score >= 8 ? "ADVANCED" : score >= 6 ? "SOLID" : score >= 4 ? "AVERAGE" : score >= 2 ? "BELOW AVG" : "BEGINNER";

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a1a2e" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs text-white/30 font-mono">/10</span>
        </div>
      </div>
      <span className="text-xs font-bold tracking-[0.2em] mt-2" style={{ color }}>{label}</span>
    </div>
  );
}
