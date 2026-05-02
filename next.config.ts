import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript errors still enforced at build time
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
