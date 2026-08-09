"use client";

interface Props {
  label: string;
  value: number;
}

export default function SkillBar({ label, value }: Props) {
  const color =
    value >= 8 ? "bg-excellent" : value >= 6 ? "bg-good" : value >= 4 ? "bg-neutral" : value >= 2 ? "bg-bad" : "bg-terrible";
  const textColor =
    value >= 8 ? "text-excellent" : value >= 6 ? "text-good" : value >= 4 ? "text-neutral" : value >= 2 ? "text-bad" : "text-terrible";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-sm mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className={`font-mono font-bold ${textColor}`}>{value}/10</span>
      </div>
      <div className="w-full bg-bg-primary rounded-full h-2">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}
