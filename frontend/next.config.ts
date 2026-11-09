import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  agentRules: false,
  // Vercel's legacy @vercel/next builder (used via vercel.json builds)
  // cannot patch preview comments when Next 16.3+ immutable assets are on.
  supportsImmutableAssets: false,
  // Locally, the browser talks to this Next app and /api/* is proxied to FastAPI.
  // On Vercel these rewrites are skipped so /api/chat hits api/index.py instead.
  async rewrites() {
    if (process.env.VERCEL) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  turbopack: {
    root: frontendRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
