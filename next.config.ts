import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Ensure modern CSS features are transpiled
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
