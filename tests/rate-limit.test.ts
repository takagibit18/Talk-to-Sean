import { describe, expect, it } from "vitest";
import {
  createFixedWindowRateLimiter,
  getClientRateLimitKey
} from "@/lib/rate-limit";

describe("createFixedWindowRateLimiter", () => {
  it("allows requests until the fixed window limit is reached", () => {
    let now = 1_000;
    const limiter = createFixedWindowRateLimiter({
      limit: 2,
      windowMs: 1_000,
      now: () => now
    });

    expect(limiter.check("visitor-a")).toMatchObject({
      allowed: true,
      remaining: 1
    });
    expect(limiter.check("visitor-a")).toMatchObject({
      allowed: true,
      remaining: 0
    });
    expect(limiter.check("visitor-a")).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 1
    });
  });

  it("resets a key after the window expires", () => {
    let now = 1_000;
    const limiter = createFixedWindowRateLimiter({
      limit: 1,
      windowMs: 1_000,
      now: () => now
    });

    expect(limiter.check("visitor-a").allowed).toBe(true);
    expect(limiter.check("visitor-a").allowed).toBe(false);

    now = 2_000;

    expect(limiter.check("visitor-a")).toMatchObject({
      allowed: true,
      remaining: 0
    });
  });

  it("tracks different keys independently", () => {
    const limiter = createFixedWindowRateLimiter({
      limit: 1,
      windowMs: 1_000,
      now: () => 1_000
    });

    expect(limiter.check("visitor-a").allowed).toBe(true);
    expect(limiter.check("visitor-a").allowed).toBe(false);
    expect(limiter.check("visitor-b").allowed).toBe(true);
  });
});

describe("getClientRateLimitKey", () => {
  it("uses the first forwarded IP address when present", () => {
    const request = new Request("https://example.test/api/chat", {
      headers: {
        "x-forwarded-for": "203.0.113.7, 198.51.100.1"
      }
    });

    expect(getClientRateLimitKey(request)).toBe("ip:203.0.113.7");
  });

  it("falls back to a shared anonymous key without proxy headers", () => {
    const request = new Request("https://example.test/api/chat");

    expect(getClientRateLimitKey(request)).toBe("ip:anonymous");
  });
});
