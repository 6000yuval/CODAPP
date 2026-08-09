import Link from "next/link";
import { Crosshair } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Crosshair className="w-5 h-5 text-accent" />
              <span className="text-lg font-bold text-white">
                BO7 <span className="text-accent">VOD Analyzer</span>
              </span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-md">
              AI-powered competitive Call of Duty coaching. Upload your Black Ops 7
              gameplay and get a pro-level VOD review with timestamped feedback,
              mechanical skill ratings, and personalized improvement plans.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/upload" className="text-white/30 hover:text-accent transition-colors">
                  Analyze VOD
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/30 hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/30 hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/30 hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Analysis */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
              Analysis Covers
            </h4>
            <ul className="space-y-2 text-sm text-white/30">
              <li>Aim & Centering</li>
              <li>Movement Mechanics</li>
              <li>Positioning & Map Awareness</li>
              <li>Decision-Making</li>
              <li>Spawn & Rotation Timing</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} BO7 VOD Analyzer. Not affiliated with Activision or the CDL.
          </p>
          <p className="text-xs text-white/15">
            Powered by AI vision analysis. Results are analytical estimates, not definitive assessments.
          </p>
        </div>
      </div>
    </footer>
  );
}
