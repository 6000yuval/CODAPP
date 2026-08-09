"use client";

import Link from "next/link";
import { Crosshair } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Crosshair className="w-5 h-5 text-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold tracking-tight text-white">
              BO7 <span className="text-accent">VOD</span>
            </span>
            <span className="text-[10px] font-mono text-white/25 uppercase tracking-[0.2em] hidden sm:inline">
              Analyzer
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/about"
            className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block"
          >
            Blog
          </Link>
          <Link
            href="/upload"
            className="px-5 py-2 bg-accent text-bg-primary text-sm font-bold rounded-lg hover:bg-accent-dim transition-colors"
          >
            Analyze VOD
          </Link>
        </div>
      </div>
    </nav>
  );
}
