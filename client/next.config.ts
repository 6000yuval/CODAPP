import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const apiOrigin = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3001";
const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  experimental: {
    // Allow large multipart uploads through Next.js rewrite proxy.
    middlewareClientMaxBodySize: "512mb",
  },
  outputFileTracingRoot: currentDir,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
