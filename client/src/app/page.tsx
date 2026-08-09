import Link from "next/link";
import {
  Crosshair, Zap, Shield, Brain, Target, Eye, Clock,
  TrendingUp, ChevronRight, BarChart3, Users, Award,
  Gamepad2, ArrowRight, CheckCircle2, Star
} from "lucide-react";

const FEATURES = [
  {
    icon: Crosshair,
    title: "Aim & Centering Analysis",
    description:
      "Crosshair placement, recoil control, tracking accuracy, flick precision. Every gunfight broken down.",
  },
  {
    icon: Zap,
    title: "Movement Mechanics",
    description:
      "Slide-cancels, bunny hops, strafing, sprint management. Your movement graded like a CDL pro.",
  },
  {
    icon: Shield,
    title: "Positioning Review",
    description:
      "Power positions, cover usage, lane control, spawn awareness. Know where you should be and why.",
  },
  {
    icon: Brain,
    title: "Decision-Making Breakdown",
    description:
      "Engagement selection, ego challs, over-challenges, bad peeks. Every decision evaluated.",
  },
  {
    icon: Eye,
    title: "Map Awareness & Rotations",
    description:
      "Minimap usage, rotation timing, danger zone awareness. See the map like a pro sees it.",
  },
  {
    icon: BarChart3,
    title: "Recurring Pattern Detection",
    description:
      "Bad habits that repeat across your gameplay. The patterns holding you back, surfaced and called out.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Upload Your VOD",
    description: "Drop in up to 15 minutes of Black Ops 7 gameplay. MP4, MOV, WebM, AVI, or MKV.",
  },
  {
    step: "02",
    title: "AI Watches Your Full Video",
    description: "Native video analysis - the AI watches your entire gameplay as continuous video, not just still frames.",
  },
  {
    step: "03",
    title: "Get Your Coaching Report",
    description: "Timestamped feedback, skill ratings, patterns, and your top 3 priorities to improve.",
  },
];

const STATS = [
  { value: "Full", label: "Video Analyzed", suffix: "" },
  { value: "20", label: "Skill Metrics", suffix: "+" },
  { value: "~2", label: "Minutes to Report", suffix: "min" },
  { value: "$0.25", label: "Per Full Analysis", suffix: "" },
];

const ANALYSIS_AREAS = [
  "Aim Quality", "Centering", "Recoil Control", "Tracking", "Flick Accuracy",
  "Crosshair Placement", "Movement Quality", "Slide/Jump Usage", "Map Awareness",
  "Use of Cover", "Spawn Awareness", "Power Positions", "Route Choices",
  "Engagement Selection", "Over-Challenges", "Ego Challs", "Bad Peeks",
  "Rotation Timing", "Objective Play", "Danger Zone Awareness",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/5 border border-accent/15 rounded-full px-4 py-1.5 mb-8">
              <Gamepad2 className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent/80">
                Black Ops 7 Competitive Coaching Tool
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Stop Guessing.{" "}
              <span className="text-accent">Start Improving.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your Black Ops 7 gameplay and get a brutally honest, pro-level
              VOD review. Exact timestamps. Specific callouts. Real competitive
              analysis - like having a CDL coach on demand.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/upload"
                className="group flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary font-bold text-lg rounded-xl hover:bg-accent-dim transition-all animate-pulse-glow"
              >
                Analyze My Gameplay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center gap-2 px-8 py-4 bg-white/5 text-white/60 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
              >
                See How It Works
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map(({ value, label, suffix }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {value}
                    <span className="text-accent text-lg">{suffix}</span>
                  </div>
                  <div className="text-xs text-white/30 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="py-6 border-y border-border bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="text-xs text-white/20 font-medium uppercase tracking-wider mr-2">
              Analyzes:
            </span>
            {ANALYSIS_AREAS.map((area) => (
              <span
                key={area}
                className="text-[11px] text-white/25 font-mono px-2 py-0.5 bg-white/[0.02] rounded border border-white/[0.04]"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Every Aspect of Your Game, <span className="text-accent">Reviewed</span>
            </h2>
            <p className="text-white/35 max-w-xl mx-auto">
              Not generic AI advice. Specific, competitive-level coaching feedback
              on everything that matters in ranked play.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group bg-bg-card border border-border rounded-2xl p-6 hover:border-accent/20 hover:bg-bg-card-hover transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/8 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Three Steps to <span className="text-accent">Better Gameplay</span>
            </h2>
            <p className="text-white/35 max-w-lg mx-auto">
              Upload, wait a couple minutes, and get a report that would take a
              human coach hours to produce.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, description }, i) => (
              <div key={step} className="relative">
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-5 w-6 h-6 text-accent/20" />
                )}
                <div className="bg-bg-card border border-border rounded-2xl p-8 text-center h-full">
                  <div className="text-5xl font-black text-accent/15 font-mono mb-4">
                    {step}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Your Report <span className="text-accent">Includes</span>
            </h2>
            <p className="text-white/35 max-w-lg mx-auto">
              A structured, pro-level coaching report covering every dimension of
              competitive COD performance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Award, title: "Overall Skill Rating", desc: "1-10 CDL-calibrated score with tier label" },
              { icon: TrendingUp, title: "Key Strengths", desc: "What you're doing right - genuine positives only" },
              { icon: Target, title: "Key Mistakes", desc: "Exact mistakes with timestamps and severity" },
              { icon: Clock, title: "Timestamp Analysis", desc: "Every critical moment broken down second by second" },
              { icon: Eye, title: "Recurring Patterns", desc: "Bad habits surfaced with frequency and impact ratings" },
              { icon: Crosshair, title: "Mechanical Ratings", desc: "8 metrics: aim, centering, recoil, tracking, flicks..." },
              { icon: Brain, title: "Decision Review", desc: "Ego challs, bad peeks, over-challenges catalogued" },
              { icon: Shield, title: "Positioning Review", desc: "6 metrics: map awareness, cover, spawns, routes..." },
              { icon: Star, title: "Top 3 Priorities", desc: "The 3 most impactful things to fix right now" },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 bg-bg-card/50 border border-border rounded-xl p-5 hover:border-accent/15 transition-colors"
              >
                <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial-style social proof */}
      <section className="py-20 bg-bg-secondary/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gold fill-gold" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl text-white/70 font-medium leading-relaxed mb-6">
            &ldquo;Like having a CDL analyst break down your gameplay in 2 minutes.
            It caught habits I didn&apos;t even know I had - ego challing the same angle
            over and over, never using my minimap on rotations.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white/70">Ranked Play Grinder</div>
              <div className="text-xs text-white/30">Iridescent, 1.4 K/D</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ for SEO */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black text-white mb-12 text-center">
            Frequently Asked <span className="text-accent">Questions</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "What game modes does the analyzer support?",
                a: "The analyzer works with all Black Ops 7 game modes including Hardpoint, Search & Destroy, Control, and standard respawn modes. It automatically detects the game mode from your HUD.",
              },
              {
                q: "How long does the analysis take?",
                a: "A full 15-minute VOD analysis typically completes in 1-3 minutes. Shorter clips are faster.",
              },
              {
                q: "What video formats are supported?",
                a: "MP4, WebM, MOV, AVI, and MKV. For best results, upload 1080p or higher resolution with the full HUD visible.",
              },
              {
                q: "How accurate is the AI analysis?",
                a: "The analyzer uses native video understanding to review your full gameplay flow, not isolated still frames. It is strongest at positioning and decisions, and provides directional estimates for mechanical consistency.",
              },
              {
                q: "What's the maximum video length?",
                a: "15 minutes. This covers a full Hardpoint game or 2-3 Search & Destroy rounds - enough to identify patterns and habits.",
              },
              {
                q: "How is this different from generic AI advice?",
                a: "This tool is specifically tuned for competitive Call of Duty. It understands COD-specific concepts like ego challs, over-challenges, spawn awareness, rotation timing, and power positions. The feedback uses competitive COD terminology and references specific timestamps in your gameplay.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group bg-bg-card border border-border rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium text-sm hover:bg-bg-card-hover transition-colors">
                  {q}
                  <ChevronRight className="w-4 h-4 text-white/30 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-white/40 text-sm leading-relaxed border-t border-border pt-4">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">
            Upload your gameplay. Get your report. Start winning more gunfights.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-3 px-10 py-5 bg-accent text-bg-primary font-bold text-xl rounded-xl hover:bg-accent-dim transition-all animate-pulse-glow"
          >
            <Crosshair className="w-6 h-6" />
            Analyze My VOD
          </Link>
          <p className="text-white/15 text-xs mt-6">
            No account required. Upload and analyze instantly.
          </p>
        </div>
      </section>
    </>
  );
}


