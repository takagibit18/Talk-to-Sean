import { describe, expect, it } from "vitest";
import { getEnvValidationResult, validateEnv } from "@/lib/config";

const baseEnv = {
  OPENAI_API_KEY: "sk-test-key",
  GITHUB_USERNAME: "takagibit18",
};

describe("env config", () => {
  it("reports a missing OpenAI key with a clear message", () => {
    const result = getEnvValidationResult({ GITHUB_USERNAME: "takagibit18" });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("OPENAI_API_KEY is required");
  });

  it("rejects invalid provider base URLs", () => {
    const result = getEnvValidationResult({
      ...baseEnv,
      OPENAI_BASE_URL: "not-a-url",
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Invalid URL");
  });

  it("normalizes defaults and comma-separated dev origins", () => {
    const env = validateEnv({
      ...baseEnv,
      ALLOWED_DEV_ORIGINS: "10.80.12.101, localhost:3001",
    });

    expect(env.OPENAI_MODEL).toBe("gpt-5-mini");
    expect(env.OPENAI_BASE_URL).toBe("https://api.openai.com/v1");
    expect(env.ALLOWED_DEV_ORIGINS).toEqual(["10.80.12.101", "localhost:3001"]);
  });
});
