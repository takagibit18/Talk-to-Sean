import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import { validateEnv } from "./lib/config";

function buildConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isPreview = process.env.VERCEL_ENV === "preview";
  const env = validateEnv(process.env, {
    requireOpenAIKey: !isDev,
  });

  return {
    eslint: { ignoreDuringBuilds: true },
    images: {
      unoptimized: true,
    },
    allowedDevOrigins: isDev && !isPreview ? env.ALLOWED_DEV_ORIGINS : [],
  };
}

export default buildConfig;
