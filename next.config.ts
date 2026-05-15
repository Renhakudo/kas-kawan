import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // TypeScript errors still enforced at build time
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
