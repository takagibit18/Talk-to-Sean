import { describe, expect, it } from "vitest";
import { CV_DATA } from "@/lib/cv-data";
import { FEATURED_PROJECTS } from "@/lib/project-highlights";

function findProject(title: string) {
  const project = FEATURED_PROJECTS.find((item) => item.title.toLowerCase() === title);
  if (!project) throw new Error(`Missing featured project: ${title}`);
  return project;
}

describe("homepage content refresh", () => {
  it("positions the about section around AI-native traceable systems in both locales", () => {
    expect(CV_DATA.en.about.body).toContain("AI Native");
    expect(CV_DATA.en.about.body).toContain("prototype");
    expect(CV_DATA.en.about.body).toContain("trace");
    expect(CV_DATA.en.about.body).toContain("evaluate");
    expect(CV_DATA.en.about.body).toContain("harden");
    expect(CV_DATA.en.about.body).toContain("Content Operating System");

    expect(CV_DATA.zh.about.body).toContain("AI Native");
    expect(CV_DATA.zh.about.body).toContain("原型");
    expect(CV_DATA.zh.about.body).toContain("追踪");
    expect(CV_DATA.zh.about.body).toContain("评测");
    expect(CV_DATA.zh.about.body).toContain("打磨");
    expect(CV_DATA.zh.about.body).toContain("内容操作系统");
  });

  it("covers the documented frontend, model, retrieval, and context-engineering skills", () => {
    const englishSkills = CV_DATA.en.skills.flatMap((group) => group.items);
    const chineseSkills = CV_DATA.zh.skills.flatMap((group) => group.items);

    for (const skill of [
      "TypeScript",
      "Next.js",
      "React",
      "DeepSeek",
      "Qdrant",
      "Chroma",
      "FastAPI",
      "Vercel AI SDK",
      "Context Engineering",
    ]) {
      expect(englishSkills).toContain(skill);
    }

    for (const skill of [
      "TypeScript",
      "Next.js",
      "React",
      "DeepSeek",
      "Qdrant",
      "Chroma",
      "FastAPI",
      "Vercel AI SDK",
      "上下文工程",
    ]) {
      expect(chineseSkills).toContain(skill);
    }
  });

  it("uses quantified MergeWarden evidence and bilingual shotgunCV positioning", () => {
    const mergeWarden = findProject("mergewarden");
    const shotgunCV = findProject("shotguncv");

    for (const locale of ["en", "zh"] as const) {
      const mergeText = [
        mergeWarden.description[locale],
        mergeWarden.problem[locale],
        mergeWarden.architecture[locale],
        mergeWarden.evidence[locale],
      ].join(" ");

      expect(mergeText).toContain("84%");
      expect(mergeText).toContain("95.1%");
      expect(mergeText).toContain("50%");
      expect(mergeText).toContain("100%");
      expect(mergeWarden.stack).toEqual(
        expect.arrayContaining(["Python", "FastAPI", "DeepSeek v4-pro", "Pydantic", "Docker", "pytest", "asyncio"]),
      );

      expect(shotgunCV.description[locale]).toContain("Pipeline");
      expect(shotgunCV.evidence[locale]).toContain(locale === "en" ? "eval-oriented" : "评测");
    }
  });

  it("replaces the single generic highlight with concrete bilingual project highlights", () => {
    expect(CV_DATA.en.publications).toHaveLength(3);
    expect(CV_DATA.zh.publications).toHaveLength(3);

    expect(CV_DATA.en.publications.map((item) => item.href)).toEqual(
      expect.arrayContaining(["https://github.com/takagibit18/MergeWarden", "https://github.com/takagibit18/shotgunCV"]),
    );
    expect(CV_DATA.en.publications.map((item) => item.org).join(" ")).toContain("95.1%");
    expect(CV_DATA.en.publications.map((item) => item.org).join(" ")).toContain("50%");
    expect(CV_DATA.zh.publications.map((item) => item.org).join(" ")).toContain("95.1%");
    expect(CV_DATA.zh.publications.map((item) => item.org).join(" ")).toContain("50%");
  });
});
