import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.80.12.101"],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
