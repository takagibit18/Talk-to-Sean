import { beforeEach, describe, expect, it, vi } from "vitest";

describe("health and config-check routes", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 401 })),
    );
  });

  it("returns a healthy status without touching external services", async () => {
    const route = await import("@/app/api/health/route");
    const response = await route.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it("returns masked config state in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("GITHUB_USERNAME", "takagibit18");
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");

    const route = await import("@/app/api/dev/config-check/route");
    const response = await route.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.OPENAI_API_KEY).toBe("configured");
    expect(body.OPENAI_MODEL).toBe("gpt-5-mini");
    expect(body.OPENAI_BASE_URL).toBe("https://api.openai.com/v1");
  });

  it("returns config errors when the OpenAI key is missing in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("GITHUB_USERNAME", "takagibit18");
    vi.stubEnv("OPENAI_API_KEY", "");

    const route = await import("@/app/api/dev/config-check/route");
    const response = await route.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.OPENAI_API_KEY).toBe("missing");
    expect(body.errors).toContain("OPENAI_API_KEY is not configured");
  });

  it("returns 404 outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const route = await import("@/app/api/dev/config-check/route");
    const response = await route.GET();

    expect(response.status).toBe(404);
  });
});
