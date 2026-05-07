describe("wiki context", () => {
  it("loads deterministic LLM Wiki pages for runtime grounding", async () => {
    const { getWikiContext, WIKI_CONTEXT_FILES } = await import(
      "@/lib/wiki-context"
    );

    expect(WIKI_CONTEXT_FILES).toEqual([
      "knowledge/wiki/index.md",
      "knowledge/wiki/sean.md",
      "knowledge/wiki/projects.md",
      "knowledge/wiki/capabilities.md",
      "knowledge/wiki/interview-qa.md",
      "knowledge/wiki/voice.md",
      "knowledge/wiki/boundaries.md"
    ]);

    const context = getWikiContext();

    expect(context).toContain("# Sean Yu");
    expect(context).toContain("shotgunCV");
    expect(context).toContain("Mergewarden");
    expect(context).toContain("huali6641@gmail.com");
    expect(context).toContain("Do not output private contact channels");
    expect(context).not.toContain("Sean_Yu3");
    expect(context).toContain("AI-native developer");
    expect(context).toContain("standard English documentation");
    expect(context).not.toContain("15061235115");
  });
});
