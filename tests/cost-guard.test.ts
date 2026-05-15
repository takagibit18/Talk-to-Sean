import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkCostGuard, resetMemoryUsageForTests } from "@/lib/cost-guard";

describe("cost guard", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("DAILY_IP_LIMIT", "3");
    vi.stubEnv("DAILY_REQUEST_LIMIT", "100");
    resetMemoryUsageForTests();
  });

  it("returns quota_exhausted after the per-IP daily limit is exceeded", async () => {
    await expect(checkCostGuard("203.0.113.8")).resolves.toMatchObject({ allowed: true });
    await expect(checkCostGuard("203.0.113.8")).resolves.toMatchObject({ allowed: true });
    await expect(checkCostGuard("203.0.113.8")).resolves.toMatchObject({ allowed: true });

    await expect(checkCostGuard("203.0.113.8")).resolves.toMatchObject({
      allowed: false,
      errorCode: "QUOTA_EXHAUSTED",
    });
  });

  it("returns quota_exhausted after the per-session daily limit is exceeded", async () => {
    vi.stubEnv("DAILY_IP_LIMIT", "100");
    vi.stubEnv("DAILY_SESSION_LIMIT", "2");

    await expect(checkCostGuard("203.0.113.8", "session-a")).resolves.toMatchObject({ allowed: true });
    await expect(checkCostGuard("203.0.113.9", "session-a")).resolves.toMatchObject({ allowed: true });

    await expect(checkCostGuard("203.0.113.10", "session-a")).resolves.toMatchObject({
      allowed: false,
      errorCode: "QUOTA_EXHAUSTED",
    });
  });

  it("fails closed in production when persistent Redis limits are not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    await expect(checkCostGuard("203.0.113.8", "session-a")).resolves.toMatchObject({
      allowed: false,
      errorCode: "PROTECTION_MISCONFIGURED",
    });
  });
});
