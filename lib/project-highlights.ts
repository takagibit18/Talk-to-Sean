import type { Locale } from "@/lib/locale";

export type FeaturedProject = {
  title: string;
  href: string;
  repoHref: string;
  language: string;
  repoAliases: string[];
  description: Record<Locale, string>;
  problem: Record<Locale, string>;
  architecture: Record<Locale, string>;
  evidence: Record<Locale, string>;
  stack: string[];
  metrics: ProjectMetric[];
  architectureDiagram: ProjectArchitecture;
};

export type ProjectMetric = {
  value: string;
  label: Record<Locale, string>;
  source: string;
};

export type ProjectArchitectureNode = {
  id: string;
  label: Record<Locale, string>;
  x: number;
  y: number;
  state: "idle" | "processing" | "verified" | "stable";
};

export type ProjectArchitectureEdge = {
  from: string;
  to: string;
};

export type ProjectArchitecture = {
  id: string;
  label: Record<Locale, string>;
  nodes: ProjectArchitectureNode[];
  edges: ProjectArchitectureEdge[];
};

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    title: "shotgunCV",
    href: "https://github.com/takagibit18/shotgunCV",
    repoHref: "https://github.com/takagibit18/shotgunCV",
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
    metrics: [
      {
        value: "2",
        label: { en: "Parsed inputs", zh: "解析输入" },
        source: "docs/interview-project-qna-50.md §41: JD + resume parsing",
      },
      {
        value: "5",
        label: { en: "Evaluable stages", zh: "可评测阶段" },
        source: "docs/interview-project-qna-50.md §41: parse → generate → score → rank → strategy",
      },
    ],
    architectureDiagram: {
      id: "shotguncv-pipeline",
      label: { en: "shotgunCV evaluation pipeline", zh: "shotgunCV 评测流水线" },
      nodes: [
        { id: "jd", label: { en: "Job description", zh: "职位描述" }, x: 70, y: 56, state: "idle" },
        { id: "resume", label: { en: "Base resume", zh: "基础简历" }, x: 70, y: 164, state: "idle" },
        { id: "parse", label: { en: "Typed parse", zh: "结构化解析" }, x: 220, y: 110, state: "processing" },
        { id: "generate", label: { en: "Generate variants", zh: "生成版本" }, x: 370, y: 62, state: "processing" },
        { id: "score", label: { en: "Score + rank", zh: "评分排序" }, x: 370, y: 158, state: "processing" },
        { id: "strategy", label: { en: "Strategy output", zh: "策略输出" }, x: 530, y: 110, state: "verified" },
      ],
      edges: [
        { from: "jd", to: "parse" },
        { from: "resume", to: "parse" },
        { from: "parse", to: "generate" },
        { from: "generate", to: "score" },
        { from: "score", to: "strategy" },
      ],
    },
  },
  {
    title: "MergeWarden",
    href: "https://merge-warden.vercel.app/",
    repoHref: "https://github.com/takagibit18/MergeWarden",
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
    metrics: [
      {
        value: "84%",
        label: { en: "Latency reduced", zh: "最坏延迟降低" },
        source: "docs/v3.1-plan-prompt.md: 375s → 60s hard timeout evidence",
      },
      {
        value: "95.1%",
        label: { en: "Context reduced", zh: "上下文缩减" },
        source: "docs/v3.1-plan-prompt.md: 75,466 → 3,691 chars per file",
      },
      {
        value: "50%",
        label: { en: "Golden hit rate", zh: "Golden 命中率" },
        source: "docs/v3.1-plan-prompt.md: R10 golden evaluation",
      },
      {
        value: "100%",
        label: { en: "Schema validity", zh: "Schema 合法率" },
        source: "docs/v3.1-plan-prompt.md: R10 structured output closure",
      },
    ],
    architectureDiagram: {
      id: "mergewarden-agent-loop",
      label: { en: "MergeWarden review agent runtime", zh: "MergeWarden 审查 Agent 运行时" },
      nodes: [
        { id: "diff", label: { en: "PR diff", zh: "PR 差异" }, x: 68, y: 110, state: "idle" },
        { id: "query", label: { en: "QueryEngine", zh: "QueryEngine" }, x: 210, y: 110, state: "processing" },
        { id: "tools", label: { en: "ReAct tools", zh: "ReAct 工具" }, x: 354, y: 58, state: "processing" },
        { id: "context", label: { en: "Diff-first context", zh: "Diff-first 上下文" }, x: 354, y: 162, state: "processing" },
        { id: "submit", label: { en: "Submit review", zh: "提交审查" }, x: 520, y: 110, state: "verified" },
      ],
      edges: [
        { from: "diff", to: "query" },
        { from: "query", to: "tools" },
        { from: "tools", to: "query" },
        { from: "query", to: "context" },
        { from: "context", to: "query" },
        { from: "query", to: "submit" },
      ],
    },
  },
];
