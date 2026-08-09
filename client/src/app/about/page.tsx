import type { Metadata } from "next";
import Link from "next/link";
import {
  Crosshair, Eye, Brain, Zap, Shield, Target, BarChart3, Clock,
  ArrowRight, CheckCircle2, Monitor, Cpu, FileText
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works - AI VOD Analysis Explained",
  description:
    "Learn how BO7 VOD Analyzer uses AI vision to analyze your full Call of Duty gameplay video. Understand the analysis pipeline, what metrics are evaluated, and how the coaching report is generated.",
  openGraph: {
    title: "How BO7 VOD Analyzer Works",
    description: "AI-powered full-video analysis of your COD gameplay. Here is exactly how it works.",
  },
};

const PIPELINE_STEPS = [
  {
    icon: Monitor,
    title: "1. Video Upload",
    description:
      "You upload your Black Ops 7 gameplay recording. We accept MP4, WebM, MOV, AVI, and MKV files up to 15 minutes and 512MB. No account required - just drop the file and go.",
    detail: "Your video is temporarily stored for processing and automatically deleted after analysis completes.",
  },
  {
    icon: Eye,
    title: "2. Native Video Analysis",
    description:
      "Your full video is sent directly to an AI model that watches it natively as continuous video. It sees movement, gunfights in real-time, rotations, and the full flow of your gameplay.",
    detail: "Unlike frame-based tools, we use native video understanding. The AI sees your slides, strafes, flicks, and positioning as continuous motion - exactly how a human coach would watch it.",
  },
  {
    icon: Brain,
    title: "3. Coaching Report Synthesis",
    description:
      "The model output is normalized and synthesized into a structured pro-level report with ratings, timestamps, patterns, and prioritized improvement areas.",
    detail: "A single Gemini workflow handles both video understanding and report generation for consistent outputs and simpler reliability.",
  },
  {
    icon: FileText,
    title: "4. Your Coaching Report",
    description:
      "You receive a full pro-level coaching report with an overall rating, mechanical skill breakdown, decision-making review, positioning analysis, timestamped critical moments, and your top 3 priorities for improvement.",
    detail: "The report is designed to read like a real VOD review from a CDL coach - specific, honest, and actionable.",
  },
];

const METRICS = [
  { category: "Mechanical Skills", items: ["Aim Quality", "Centering", "Recoil Control", "Tracking", "Flick Accuracy", "Crosshair Placement", "Movement Quality", "Slide/Jump Usage"] },
  { category: "Decision-Making", items: ["Engagement Selection", "Over-Challenges", "Ego Challs", "Bad Peeks", "Rotation Timing", "Objective Play"] },
  { category: "Positioning & Awareness", items: ["Map Awareness", "Use of Cover", "Spawn Awareness", "Power Positions", "Route Choices", "Danger Zone Awareness"] },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          How the <span className="text-accent">Analysis</span> Works
        </h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
          A transparent look at the technology behind your coaching report.
          No black boxes - here&apos;s exactly what happens to your gameplay.
        </p>
      </div>

      {/* Pipeline */}
      <div className="space-y-6 mb-24">
        {PIPELINE_STEPS.map(({ icon: Icon, title, description, detail }, i) => (
          <div key={title} className="relative">
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="absolute left-[27px] top-[72px] bottom-[-24px] w-px bg-gradient-to-b from-accent/20 to-transparent hidden md:block" />
            )}
            <div className="flex items-start gap-6 bg-bg-card border border-border rounded-2xl p-6 hover:border-accent/15 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-2">{description}</p>
                <p className="text-white/25 text-xs leading-relaxed">{detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What We Measure */}
      <div className="mb-24">
        <h2 className="text-3xl font-black text-white mb-8 text-center">
          20+ Metrics <span className="text-accent">Evaluated</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {METRICS.map(({ category, items }) => (
            <div key={category} className="bg-bg-card border border-border rounded-2xl p-6">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent/40 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations (honest) */}
      <div className="mb-24 bg-bg-card border border-border rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Honest Limitations
        </h2>
        <p className="text-white/40 text-sm leading-relaxed mb-4">
          We believe in transparency. Here&apos;s what the analyzer can and can&apos;t do:
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-excellent mb-3">Strong At</h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-excellent/50 flex-shrink-0 mt-0.5" /> Crosshair placement & positioning analysis</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-excellent/50 flex-shrink-0 mt-0.5" /> Movement pattern recognition</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-excellent/50 flex-shrink-0 mt-0.5" /> Decision-making evaluation from visible context</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-excellent/50 flex-shrink-0 mt-0.5" /> Map awareness from minimap reading</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-excellent/50 flex-shrink-0 mt-0.5" /> Identifying recurring bad habits</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-warning mb-3">Limitations</h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-warning/50 flex-shrink-0 mt-0.5" /> Precise frame-level mechanical metrics (exact reaction times) are estimated</li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-warning/50 flex-shrink-0 mt-0.5" /> Audio cues (footsteps, callouts) are not analyzed</li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-warning/50 flex-shrink-0 mt-0.5" /> Low resolution footage reduces analysis accuracy</li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-warning/50 flex-shrink-0 mt-0.5" /> Team comms and coordination can&apos;t be evaluated</li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-warning/50 flex-shrink-0 mt-0.5" /> Videos over 15 minutes may be truncated by the AI model</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-white mb-4">
          See It In Action
        </h2>
        <p className="text-white/35 mb-8">
          Upload a VOD and get your report in under 3 minutes.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-dim transition-all"
        >
          Try It Now <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

