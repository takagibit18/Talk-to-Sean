import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkCostGuard, resetMemoryUsageForTests } from "@/lib/cost-guard";

describe("cost guard", () => {
  beforeEach(() => {
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
});
