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
      en: "Pipeline-first AI Resume Ops for bulk applications: parse JDs, generate resume variants, score and rank them, then output application strategy. It treats resume tailoring as an evaluable workflow, not a one-shot prompt wrapper.",
      zh: "面向批量投递的 Pipeline-first AI Resume Ops：解析 JD、生成简历变体、评分排序，再输出投递策略。它把简历定制视为可评测的工作流，而不是一次性提示词封装。",
    },
    problem: {
      en: "Bulk applications turn resume tailoring into a comparison problem: many JDs, many variants, and little objective signal for priority.",
      zh: "批量投递会把简历定制变成比较问题：多份 JD、多版简历变体，但缺少客观的优先级信号。",
    },
    architecture: {
      en: "JD parsing -> resume variant generation -> scoring/ranking loop -> strategy output, with quality checks before scoring.",
      zh: "JD 解析 -> 简历变体生成 -> 评分排序循环 -> 策略输出，并在评分前设置质量检查。",
    },
    evidence: {
      en: "Grounded in the knowledge-base workflow notes: parse -> generate -> score -> rank -> strategy makes each stage independently eval-oriented.",
      zh: "依据知识库中的工作流笔记：解析 -> 生成 -> 评分 -> 排序 -> 策略，让每个阶段都能独立评测。",
    },
    stack: ["Python", "LLM API", "Pydantic", "Pipeline orchestration"],
  },
  {
    title: "MergeWarden",
    href: "https://github.com/takagibit18/MergeWarden",
    language: "Python",
    repoAliases: ["mergewarden", "review-debug-agent", "debug-agent"],
    description: {
      en: "AI Code Review Agent with structured output, a ReAct tool-execution loop, and golden-set evaluation. Hard timeout plus budget soft cap cut worst-case single model-call latency 84% (375s -> 60s), while diff-first 80-line windowing cut per-file prefetch context 95.1% (75,466 -> 3,691 chars).",
      zh: "具备结构化输出、ReAct 工具执行循环和 golden-set 评测的 AI Code Review Agent。硬超时与预算软上限将单次模型调用最坏延迟降低 84%（375s -> 60s），diff-first 80 行窗口化将单文件预读上下文减少 95.1%（75,466 -> 3,691 字符）。",
    },
    problem: {
      en: "Code review agents fail when they overfill context, stop with summary-only output, or turn timeout paths into fabricated findings.",
      zh: "代码审查 Agent 容易在上下文过载、summary-only 空输出、或超时兜底编造问题时失效。",
    },
    architecture: {
      en: "ReAct agent loop: QueryEngine -> Orchestrator -> Tool System -> Force-Submit -> Structured Review, with Pydantic validation and DeepSeek v4-pro thinking-mode protocol handling.",
      zh: "ReAct Agent 循环：QueryEngine -> Orchestrator -> Tool System -> Force-Submit -> Structured Review，并配合 Pydantic 校验与 DeepSeek v4-pro thinking-mode 协议处理。",
    },
    evidence: {
      en: "Golden eval recovered from 0% to 50% hit rate, eliminated false positives 100% (3 -> 0), and held schema validity at 100% through force-submit closure, severity floor, and expected-location relaxed confidence.",
      zh: "通过 force-submit 闭环、severity floor 和 expected-location relaxed confidence，golden eval 从 0% 恢复到 50% hit rate，误报消除 100%（3 -> 0），schema validity 保持 100%。",
    },
    stack: ["Python", "FastAPI", "DeepSeek v4-pro", "Pydantic", "Docker", "pytest", "asyncio"],
  },
];
