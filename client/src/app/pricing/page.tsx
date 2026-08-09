import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crosshair, Zap, Crown, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Affordable AI-powered Call of Duty coaching. Pay per analysis or get unlimited reviews. Plans starting from $0.99 per VOD review for Black Ops 7 gameplay analysis.",
  openGraph: {
    title: "BO7 VOD Analyzer Pricing — Affordable Pro Coaching",
    description: "Get pro-level COD coaching from $0.99 per VOD. Unlimited plans available.",
  },
};

const PLANS = [
  {
    name: "Starter",
    icon: Crosshair,
    price: "$0.99",
    period: "per analysis",
    description: "Perfect for trying it out or occasional reviews.",
    features: [
      "Full 15-minute VOD analysis",
      "Timestamped coaching feedback",
      "Mechanical skill ratings (8 metrics)",
      "Decision-making review",
      "Positioning & awareness scores",
      "Top 3 improvement priorities",
      "Downloadable report",
    ],
    cta: "Analyze Now",
    href: "/upload",
    highlight: false,
  },
  {
    name: "Grinder",
    icon: Zap,
    price: "$9.99",
    period: "per month",
    description: "For players grinding ranked who want consistent improvement.",
    features: [
      "15 VOD analyses per month",
      "Everything in Starter",
      "Recurring pattern tracking across VODs",
      "Progress tracking dashboard",
      "Priority analysis queue",
      "Compare reports over time",
      "Email report delivery",
    ],
    cta: "Start Grinding",
    href: "/upload",
    highlight: true,
  },
  {
    name: "Pro",
    icon: Crown,
    price: "$24.99",
    period: "per month",
    description: "For serious competitors and amateur teams.",
    features: [
      "Unlimited VOD analyses",
      "Everything in Grinder",
      "Team analysis (multi-POV)",
      "Opponent scouting reports",
      "Custom focus areas per analysis",
      "API access for integrations",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Go Pro",
    href: "/upload",
    highlight: false,
  },
];

const COMPARISON_ROWS = [
  { feature: "VOD analyses", starter: "Pay per use", grinder: "15/month", pro: "Unlimited" },
  { feature: "Max video length", starter: "15 min", grinder: "15 min", pro: "30 min" },
  { feature: "Mechanical ratings", starter: "8 metrics", grinder: "8 metrics", pro: "8 metrics" },
  { feature: "Timestamp analysis", starter: "Yes", grinder: "Yes", pro: "Yes" },
  { feature: "Pattern detection", starter: "Per VOD", grinder: "Cross-VOD", pro: "Cross-VOD" },
  { feature: "Progress tracking", starter: "-", grinder: "Yes", pro: "Yes" },
  { feature: "Team analysis", starter: "-", grinder: "-", pro: "Yes" },
  { feature: "API access", starter: "-", grinder: "-", pro: "Yes" },
  { feature: "Queue priority", starter: "Standard", grinder: "Priority", pro: "Instant" },
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          Simple, <span className="text-accent">Transparent</span> Pricing
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          No hidden fees. No subscriptions required. Pay for what you use,
          or save with a monthly plan.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {PLANS.map(({ name, icon: Icon, price, period, description, features, cta, href, highlight }) => (
          <div
            key={name}
            className={`relative rounded-2xl p-7 flex flex-col ${
              highlight
                ? "bg-bg-card border-2 border-accent/30 gradient-border"
                : "bg-bg-card border border-border"
            }`}
          >
            {highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg-primary text-xs font-bold px-4 py-1 rounded-full">
                Most Popular
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? "bg-accent/15" : "bg-white/5"}`}>
                <Icon className={`w-5 h-5 ${highlight ? "text-accent" : "text-white/40"}`} />
              </div>
              <h2 className="text-xl font-bold text-white">{name}</h2>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-black text-white">{price}</span>
              <span className="text-white/30 text-sm ml-2">{period}</span>
            </div>

            <p className="text-white/35 text-sm mb-6">{description}</p>

            <ul className="space-y-3 mb-8 flex-1">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/55">
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${highlight ? "text-accent" : "text-accent/50"}`} />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={href}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                highlight
                  ? "bg-accent text-bg-primary hover:bg-accent-dim"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-border"
              }`}
            >
              {cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Plan Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-white/40 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-white/50 font-semibold">Starter</th>
                <th className="text-center py-4 px-4 text-accent font-semibold">Grinder</th>
                <th className="text-center py-4 px-4 text-white/50 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(({ feature, starter, grinder, pro }) => (
                <tr key={feature} className="border-b border-border/50 hover:bg-bg-card/30 transition-colors">
                  <td className="py-3.5 px-4 text-white/50">{feature}</td>
                  <td className="py-3.5 px-4 text-center text-white/35">{starter}</td>
                  <td className="py-3.5 px-4 text-center text-white/50 bg-accent/[0.02]">{grinder}</td>
                  <td className="py-3.5 px-4 text-center text-white/35">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Pricing FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "Can I try it before subscribing?", a: "Yes! The Starter plan is pay-per-use with no commitment. Analyze one VOD for $0.99 and see if it's worth it." },
            { q: "What payment methods do you accept?", a: "All major credit cards, Apple Pay, and Google Pay through Stripe." },
            { q: "Can I cancel anytime?", a: "Absolutely. Monthly plans can be cancelled anytime with no penalty. Your remaining analyses stay active until the end of the billing period." },
            { q: "Do unused analyses roll over?", a: "No, monthly analysis credits reset each billing cycle. If you consistently need more, consider upgrading to Pro for unlimited." },
          ].map(({ q, a }) => (
            <details key={q} className="group bg-bg-card border border-border rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium text-sm hover:bg-bg-card-hover transition-colors">
                {q}
              </summary>
              <div className="px-5 pb-5 text-white/40 text-sm leading-relaxed border-t border-border pt-4">
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-20">
        <h2 className="text-3xl font-black text-white mb-4">
          Not sure? Try one analysis first.
        </h2>
        <p className="text-white/35 mb-8">
          $0.99 for a full pro-level coaching report. No account needed.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-dim transition-all"
        >
          <Crosshair className="w-5 h-5" />
          Start Your First Analysis
        </Link>
      </div>
    </div>
  );
}
