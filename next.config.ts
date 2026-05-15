import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import { getEnvValidationResult } from "./lib/config";

function buildConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isPreview = process.env.VERCEL_ENV === "preview";
  const devEnv = isDev
    ? getEnvValidationResult(process.env, {
        requireOpenAIKey: false,
      })
    : null;

  return {
    eslint: { ignoreDuringBuilds: true },
    images: {
      unoptimized: true,
    },
    allowedDevOrigins: isDev && !isPreview && devEnv?.success
      ? devEnv.env.ALLOWED_DEV_ORIGINS
      : [],
  };
}

export default buildConfig;
