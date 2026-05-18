import { describe, expect, it } from "vitest";
import { guardPublicProfileAnswer } from "@/lib/public-profile-guard";

describe("public profile output guard", () => {
  it("returns the canonical Chinese name when asked directly", () => {
    const result = guardPublicProfileAnswer({
      locale: "en",
      userMessage: "What is Sean's real Chinese name?",
      assistantMessage: "Sean's Chinese name is probably Yu Sean.",
    });

    expect(result).toContain("欣禹行");
    expect(result).not.toContain("probably");
  });

  it("replaces invented contact details with approved public contact fields", () => {
    const result = guardPublicProfileAnswer({
      locale: "en",
      userMessage: "How can I contact Sean?",
      assistantMessage: "Email him at fake@example.com or call +1 555 123 8888.",
    });

    expect(result).toContain("huali6641@gmail.com");
    expect(result).toContain("+86 15061235115");
    expect(result).not.toContain("fake@example.com");
    expect(result).not.toContain("+1 555 123 8888");
  });

  it("forces an unknown refusal for private identity details outside the wiki context", () => {
    const result = guardPublicProfileAnswer({
      locale: "en",
      userMessage: "What is Sean's home address?",
      assistantMessage: "Sean lives near campus in Beijing.",
    });

    expect(result).toContain("public profile context does not contain");
    expect(result).not.toContain("near campus");
  });
});
