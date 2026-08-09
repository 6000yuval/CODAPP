import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/analysis/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || "https://bo7vod.com"}/sitemap.xml`,
  };
}
