import { buildSeanSystemPrompt } from "@/lib/prompt";

describe("Sean prompt", () => {
  it("grounds answers in the LLM Wiki facts", () => {
    const prompt = buildSeanSystemPrompt();

    expect(prompt).toContain("LLM Wiki");
    expect(prompt).toContain("Sean Yu");
    expect(prompt).toContain("Minzu University of China");
    expect(prompt).toContain("shotgunCV");
    expect(prompt).toContain("Mergewarden");
    expect(prompt).toContain("huali6641@gmail.com");
    expect(prompt).toContain("Sean_Yu3");
    expect(prompt).toContain("AI-native developer");
    expect(prompt).toContain("standard English documentation");
    expect(prompt).toContain("frontier English technical documentation");
  });

  it("does not expose Sean's phone number", () => {
    expect(buildSeanSystemPrompt()).not.toContain("15061235115");
  });

  it("requires conservative answers for missing facts", () => {
    expect(buildSeanSystemPrompt()).toContain(
      "Do not invent metrics, timelines, employers, awards, or implementation details"
    );
  });

  it("uses Sean's first-person public profile voice", () => {
    const prompt = buildSeanSystemPrompt();

    expect(prompt).toContain("answer in first person");
    expect(prompt).toContain("Confident without being arrogant");
    expect(prompt).toContain("acknowledge it directly");
  });
});
