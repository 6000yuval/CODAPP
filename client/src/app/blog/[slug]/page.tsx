import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag, Crosshair } from "lucide-react";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog-data";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-white/30 hover:text-accent text-sm mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-white/25">
            <Calendar className="w-3 h-3" /> {post.date}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/25">
            <Clock className="w-3 h-3" /> {post.readTime}
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[10px] text-accent/50 bg-accent/5 px-2 py-0.5 rounded border border-accent/10 font-mono"
            >
              <Tag className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
          {post.title}
        </h1>
      </header>

      {/* Content */}
      <div className="prose-custom">
        {post.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 key={i} className="text-lg font-bold text-white/90 mt-8 mb-3">
                {line.slice(4)}
              </h3>
            );
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <p key={i} className="text-white/70 font-semibold mb-2 mt-4">
                {line.slice(2, -2)}
              </p>
            );
          }
          if (line.startsWith("- **")) {
            const boldEnd = line.indexOf(":**");
            if (boldEnd !== -1) {
              return (
                <div key={i} className="flex items-start gap-2 mb-2 ml-2">
                  <span className="text-accent/40 mt-1">-</span>
                  <p className="text-white/50 text-sm leading-relaxed">
                    <span className="text-white/70 font-semibold">
                      {line.slice(4, boldEnd + 1)}
                    </span>
                    {line.slice(boldEnd + 3)}
                  </p>
                </div>
              );
            }
          }
          if (line.startsWith("- ")) {
            return (
              <div key={i} className="flex items-start gap-2 mb-1.5 ml-2">
                <span className="text-accent/40 mt-1">-</span>
                <p className="text-white/50 text-sm leading-relaxed">
                  {line.slice(2)}
                </p>
              </div>
            );
          }
          if (line === "---") {
            return <hr key={i} className="border-border my-10" />;
          }
          if (line.trim() === "") {
            return <div key={i} className="h-3" />;
          }
          // Handle inline links and bold
          const parts = line.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);
          return (
            <p key={i} className="text-white/50 leading-relaxed mb-3 text-[15px]">
              {parts.map((part, j) => {
                const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                  return (
                    <Link
                      key={j}
                      href={linkMatch[2]}
                      className="text-accent hover:underline"
                    >
                      {linkMatch[1]}
                    </Link>
                  );
                }
                const boldMatch = part.match(/\*\*(.*?)\*\*/);
                if (boldMatch) {
                  return (
                    <strong key={j} className="text-white/70 font-semibold">
                      {boldMatch[1]}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-16 bg-bg-card border border-accent/15 rounded-2xl p-8 text-center gradient-border">
        <Crosshair className="w-8 h-8 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          See These Issues in Your Own Gameplay
        </h3>
        <p className="text-white/35 text-sm mb-6 max-w-md mx-auto">
          Upload your VOD and get a personalized coaching report that shows you
          exactly what to fix.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-dim transition-all"
        >
          Analyze My Gameplay
        </Link>
      </div>
    </article>
  );
}
