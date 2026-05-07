import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("chat route", () => {
  it("keeps the real chatbot on /chat", () => {
    expect(existsSync(join("app", "chat", "page.tsx"))).toBe(true);
  });

  it("applies request rate limiting before model invocation", () => {
    const routeSource = readFileSync(join("app", "api", "chat", "route.ts"), "utf8");

    expect(routeSource).toContain("getClientRateLimitKey");
    expect(routeSource).toContain("status: 429");
    expect(routeSource.indexOf("chatRateLimiter.check")).toBeLessThan(
      routeSource.indexOf("const result = streamText")
    );
  });
});
