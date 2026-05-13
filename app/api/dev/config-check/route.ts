import { NextResponse } from "next/server";
import { DEFAULT_OPENAI_BASE_URL, DEFAULT_OPENAI_MODEL, getEnvValidationResult } from "@/lib/config";

export const dynamic = "force-dynamic";

async function checkProviderConnectivity(baseURL: string) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(`${baseURL.replace(/\/$/, "")}/models`, {
      method: "GET",
      signal: controller.signal,
    });

    return {
      reachable: response.ok || response.status === 401 || response.status === 403,
      status: response.status,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      reachable: false,
      status: null,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Connectivity check failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = getEnvValidationResult(process.env, {
    missingOpenAIKeyMessage: "OPENAI_API_KEY is not configured",
  });

  const baseURL = result.success ? result.env.OPENAI_BASE_URL : process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL;
  const model = result.success ? result.env.OPENAI_MODEL : process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const errors = result.success ? [] : result.errors;
  const canCheckConnectivity = !errors.includes("Invalid URL");
  const connectivity = canCheckConnectivity
    ? await checkProviderConnectivity(baseURL)
    : { reachable: false, status: null, latencyMs: null, error: "Invalid URL" };

  return NextResponse.json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim() ? "configured" : "missing",
    OPENAI_MODEL: model,
    OPENAI_BASE_URL: baseURL,
    errors,
    connectivity,
  });
}
