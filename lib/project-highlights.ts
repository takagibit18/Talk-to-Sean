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
      en: "Pipeline-first workflow for measurable resume parsing, generation, scoring, and ranking.",
      zh: "Pipeline-first 工作流：让简历解析、生成、评分与排序都可衡量。",
    },
    problem: {
      en: "Many JDs and variants create priority noise without objective comparison signals.",
      zh: "多份 JD 与多版简历会制造优先级噪声，缺少客观比较信号。",
    },
    architecture: {
      en: "JD parser, variant generator, scoring loop, and strategy output with quality gates before ranking.",
      zh: "JD 解析器、简历变体生成、评分循环与策略输出；排序前先做质量门控。",
    },
    evidence: {
      en: "Each eval-oriented stage can be scored, compared, and improved independently.",
      zh: "每个评测导向阶段都可独立评分、比较与改进。",
    },
    stack: ["Python", "LLM API", "Pydantic", "Pipeline orchestration"],
  },
  {
    title: "MergeWarden",
    href: "https://merge-warden.vercel.app/",
    language: "Python",
    repoAliases: ["mergewarden", "review-debug-agent", "debug-agent"],
    description: {
      en: "AI code review agent with structured output, ReAct tools, and golden-set evaluation.",
      zh: "具备结构化输出、ReAct 工具循环与 golden-set 评测的 AI 代码审查 Agent。",
    },
    problem: {
      en: "Review agents break when context overflows, output collapses, or timeout fallbacks fabricate findings.",
      zh: "上下文过载、空输出和超时兜底编造问题，都会让审查 Agent 失效。",
    },
    architecture: {
      en: "QueryEngine, orchestrator, tool system, force-submit path, and Pydantic-validated structured review.",
      zh: "QueryEngine、编排器、工具系统、force-submit 路径与 Pydantic 结构化校验。",
    },
    evidence: {
      en: "Cut worst-case latency 84%, reduced context 95.1%, reached 50% hit rate, and kept schema validity at 100%.",
      zh: "最坏延迟降低 84%，上下文减少 95.1%，hit rate 达到 50%，schema validity 保持 100%。",
    },
    stack: ["Python", "FastAPI", "DeepSeek v4-pro", "Pydantic", "Docker", "pytest", "asyncio"],
  },
];
