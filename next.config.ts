import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow next to compile normally
  typescript: {
    // Ignore build errors for now to allow easier initial migrations
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
