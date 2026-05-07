import type { Locale } from "@/lib/locale";

export type FeaturedProject = {
  title: string;
  href: string;
  language: string;
  repoAliases: string[];
  description: Record<Locale, string>;
  problem: Record<Locale, string>;
  architecture: Record<Locale, string>;
  evidence: Record<Locale, string>;
  stack: string[];
};

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    title: "shotgunCV",
    href: "https://github.com/takagibit18/shotgunCV",
    language: "Python",
    repoAliases: ["shotguncv"],
    description: {
      en: "A pipeline-first AI Resume Ops project for high-volume applications. It batches JD parsing, generates resume variants, scores and ranks them, and outputs application strategy so users can make better bulk job-search decisions.",
      zh: "面向海投场景的 Pipeline-first AI Resume Ops 项目，批量解析多岗位 JD，生成简历变体，进行评分与排序，并输出投递策略，帮助用户做更好的批量求职决策。",
    },
    problem: {
      en: "Bulk applications make resume tailoring repetitive and hard to compare objectively.",
      zh: "批量投递时，岗位解析、简历定制和方案比较都很重复，也缺少客观排序依据。",
    },
    architecture: {
      en: "JD parser -> resume variant generator -> scoring/ranking loop -> application strategy output.",
      zh: "JD 解析 -> 简历变体生成 -> 评分排序循环 -> 投递策略输出。",
    },
    evidence: {
      en: "Shows an eval-oriented pipeline, not a one-off prompt wrapper.",
      zh: "展示的是评测导向的流水线，而不是一次性提示词封装。",
    },
    stack: ["Python", "LLM API", "Pipeline", "Scoring"],
  },
  {
    title: "Mergewarden",
    href: "https://github.com/takagibit18/MergeWarden",
    language: "Python",
    repoAliases: ["mergewarden", "review-debug-agent", "debug-agent"],
    description: {
      en: "An LLM-powered code review and debugging assistant for teams and local pipelines. It turns diffs and failure signals into graded review findings and verifiable debugging steps, with containerized deployment and CI integration.",
      zh: "面向团队与本机流水线的 LLM 代码审查与调试助手，将变更集和失败信号转化为分级审查结论与可验证的调试步骤，并支持容器化部署与 CI 集成。",
    },
    problem: {
      en: "Review feedback and CI failures are noisy unless they become ranked, reproducible engineering actions.",
      zh: "代码审查反馈和 CI 失败信号很容易噪声化，关键是转成有优先级、可复现的工程动作。",
    },
    architecture: {
      en: "Diff and failure ingestion -> LLM review rubric -> graded findings -> reproducible debug plan.",
      zh: "变更和失败信号输入 -> LLM 审查规约 -> 分级结论 -> 可复现调试计划。",
    },
    evidence: {
      en: "Connects agent reasoning with review severity, containers, and CI handoff.",
      zh: "把 Agent 推理、审查等级、容器化和 CI 交接串成完整链路。",
    },
    stack: ["Python", "FastAPI", "LangChain", "Docker", "CI"],
  },
];
