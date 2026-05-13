import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/chat/route";
import { resetMemoryUsageForTests } from "@/lib/cost-guard";
import { resetRateLimitForTests } from "@/lib/rate-limit";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.9",
    },
    body: JSON.stringify(body),
  });
}

describe("chat route errors", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("GITHUB_USERNAME", "takagibit18");
    resetMemoryUsageForTests();
    resetRateLimitForTests();
  });

  it("returns MISSING_API_KEY when the provider key is absent", async () => {
    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "hello" }] }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.errorCode).toBe("MISSING_API_KEY");
  });

  it("returns INVALID_MESSAGE for malformed messages", async () => {
    const response = await POST(makeRequest({ messages: [{ role: "user", content: "" }] }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errorCode).toBe("INVALID_MESSAGE");
  });
});
