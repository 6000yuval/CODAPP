import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog — COD Tips, Guides & Competitive Insights",
  description:
    "Expert Call of Duty: Black Ops 7 guides, tips, and competitive insights. Learn positioning, aim training, ranked play strategies, and pro-level techniques from our coaching AI.",
  openGraph: {
    title: "BO7 VOD Analyzer Blog — COD Guides & Tips",
    description: "Expert Black Ops 7 guides covering aim, movement, positioning, and ranked play strategies.",
  },
};

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          The <span className="text-accent">Competitive Edge</span> Blog
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          Pro-level guides, tips, and insights to help you dominate
          Black Ops 7 ranked play.
        </p>
      </div>

      {/* Featured post */}
      {BLOG_POSTS[0] && (
        <Link
          href={`/blog/${BLOG_POSTS[0].slug}`}
          className="block bg-bg-card border border-border rounded-2xl p-8 mb-8 hover:border-accent/20 transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-accent/10 text-accent text-xs font-mono px-3 py-1 rounded-lg">
              Featured
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/25">
              <Calendar className="w-3 h-3" /> {BLOG_POSTS[0].date}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/25">
              <Clock className="w-3 h-3" /> {BLOG_POSTS[0].readTime}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
            {BLOG_POSTS[0].title}
          </h2>
          <p className="text-white/40 leading-relaxed mb-4">{BLOG_POSTS[0].excerpt}</p>
          <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium group-hover:gap-3 transition-all">
            Read more <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      )}

      {/* Post grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {BLOG_POSTS.slice(1).map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="bg-bg-card border border-border rounded-2xl p-6 hover:border-accent/15 transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 text-xs text-white/20">
                <Calendar className="w-3 h-3" /> {post.date}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/20">
                <Clock className="w-3 h-3" /> {post.readTime}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
              {post.title}
            </h3>
            <p className="text-white/35 text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-[10px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04] font-mono">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
