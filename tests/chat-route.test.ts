import { existsSync } from "node:fs";
import { join } from "node:path";

describe("chat route", () => {
  it("keeps the real chatbot on /chat", () => {
    expect(existsSync(join("app", "chat", "page.tsx"))).toBe(true);
  });
});
