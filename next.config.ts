import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // seed/ musi trafić do bundla serverless — bez tego /api/reset
  // nie znajdzie plików startowych na Vercel.
  outputFileTracingIncludes: {
    "/api/reset": ["./seed/**/*"],
  },
};

export default nextConfig;
