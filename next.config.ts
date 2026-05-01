import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don't fail build on TS errors during dev iteration
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
