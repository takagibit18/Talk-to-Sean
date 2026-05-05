import { createOpenAI } from "@ai-sdk/openai";

const defaultOpenAIBaseURL = "https://api.openai.com/v1";

export function getModelConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const baseURL = normalizeBaseURL(
    process.env.OPENAI_BASE_URL?.trim() || process.env.BASEURL?.trim()
  );
  const modelName = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return {
    apiKey,
    baseURL,
    modelName
  };
}

export function getChatModel() {
  const { apiKey, baseURL, modelName } = getModelConfig();
  const provider = createOpenAI({
    apiKey,
    baseURL
  });

  return provider.chat(modelName);
}

function normalizeBaseURL(baseURL: string | undefined) {
  if (!baseURL) {
    return defaultOpenAIBaseURL;
  }

  try {
    const parsed = new URL(baseURL);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("OPENAI_BASE_URL must use http or https.");
    }

    return baseURL;
  } catch {
    throw new Error("OPENAI_BASE_URL must be an absolute http(s) URL.");
  }
}
