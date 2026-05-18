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

function makeRequestWithOrigin(body: unknown, origin: string) {
  return new NextRequest("https://talk-to-sean.vercel.app/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "origin": origin,
      "x-forwarded-for": "203.0.113.9",
    },
    body: JSON.stringify(body),
  });
}

function makeProviderStream(chunks: string[]) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe("chat route errors", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
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

  it("rejects cross-site browser posts before provider access", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");

    const response = await POST(
      makeRequestWithOrigin(
        { messages: [{ role: "user", content: "hello" }] },
        "https://attacker.example",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.errorCode).toBe("FORBIDDEN_ORIGIN");
  });
});

describe("chat route streaming", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.stubEnv("GITHUB_USERNAME", "takagibit18");
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    vi.stubEnv("OPENAI_MODEL", "gpt-test");
    vi.stubEnv("OPENAI_BASE_URL", "https://api.example.com/v1");
    resetMemoryUsageForTests();
    resetRateLimitForTests();
  });

  it("streams provider deltas as a plain text response", async () => {
    const providerFetch = vi.fn().mockResolvedValue(
      new Response(
        makeProviderStream([
          'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
          'data: {"usage":{"prompt_tokens":4,"completion_tokens":2,"total_tokens":6},"choices":[{"delta":{}}]}\n\n',
          "data: [DONE]\n\n",
        ]),
        {
          status: 200,
          headers: { "content-type": "text/event-stream" },
        },
      ),
    );
    vi.stubGlobal("fetch", providerFetch);

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "hello" }], locale: "en" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    await expect(response.text()).resolves.toBe("Hello world");
    expect(JSON.parse(String(providerFetch.mock.calls[0][1]?.body))).toMatchObject({
      stream: true,
      stream_options: { include_usage: true },
    });
    expect(response.headers.get("set-cookie")).toContain("tts_session=");
  });

  it("sends a strict groundedness instruction and guards invented contact output", async () => {
    const providerFetch = vi.fn().mockResolvedValue(
      new Response(
        makeProviderStream([
          'data: {"choices":[{"delta":{"content":"Email Sean at fake@example.com."}}]}\n\n',
          "data: [DONE]\n\n",
        ]),
        {
          status: 200,
          headers: { "content-type": "text/event-stream" },
        },
      ),
    );
    vi.stubGlobal("fetch", providerFetch);

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "How can I contact Sean?" }], locale: "en" }),
    );

    const requestBody = JSON.parse(String(providerFetch.mock.calls[0][1]?.body));
    expect(requestBody.messages[0].content).toContain(
      "If the public profile context does not contain the answer, say so instead of guessing or inventing.",
    );
    expect(requestBody.messages[0].content).toContain("欣禹行");
    await expect(response.text()).resolves.toContain("huali6641@gmail.com");
  });
});
