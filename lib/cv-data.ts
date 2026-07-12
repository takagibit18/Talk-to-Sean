import type { Locale } from "@/lib/locale";

export type CVEducation = {
  period: string;
  school: string;
  title: string;
  desc: string;
};

export type CVSkillGroup = {
  group: string;
  items: string[];
};

export type CVCapability = {
  id: "agent-runtime" | "evaluation" | "backend" | "infrastructure" | "retrieval";
  name: string;
  description: string;
  technologies: string[];
};

export type CVLanguage = {
  name: string;
  level: string;
};

export type CVPublication = {
  title: string;
  org: string;
  year: string;
  href?: string;
};

export type CVHeroProof = {
  label: string;
  value: string;
  detail: string;
};

/** Social entry: use `href` for links; omit `href` and set `text` for WeChat ID / handle. */
export type CVSocial = {
  label: string;
  href?: string;
  text?: string;
  /** Opens modal contact UI (see `contact.weChat` strings). */
  kind?: "wechat" | "handle";
};

export type CVContactWeChat = {
  modalClose: string;
  modalCopy: string;
  modalCopied: string;
  modalCopyFailed: string;
  modalQrAlt: string;
};

export type CVData = {
  nav: {
    sectionsLabel: string;
    switchToLightTheme: string;
    switchToDarkTheme: string;
    availability: string;
    downloadCv: string;
    exploreProjects: string;
    contactMe: string;
    scroll: string;
    timezone: string;
  };
  hero: {
    availability: string;
    processingLabel: string;
    verifiedResultLabel: string;
    yearsBadge: string;
    name: string;
    nameLatin: string;
    intent: string;
    role: string;
    location: string;
    signals: string[];
    quote: string;
    talkToSean: string;
    labTitle: string;
    labSubtitle: string;
    proofPoints: CVHeroProof[];
  };
  sections: {
    about: string;
    skills: string;
    projects: string;
    activity: string;
    education: string;
    languages: string;
    publications: string;
    contact: string;
  };
  about: {
    meta: string;
    body: string;
  };
  skills: CVSkillGroup[];
  skillsUi: {
    stackLabel: string;
    ecosystemLabel: string;
    cloudVisualLabel: string;
    ecosystemDescription: string;
    matrixLabel: string;
    matrixDescription: string;
    verifiedLabel: string;
    processingLabel: string;
    activeLabel: string;
  };
  capabilities: CVCapability[];
  projects: {
    emptyState: string;
    updated: string;
    today: string;
    yesterday: string;
    day: string;
    week: string;
    month: string;
    ago: string;
    noDescription: string;
    problemLabel: string;
    architectureLabel: string;
    stackLabel: string;
    evidenceLabel: string;
    metricsLabel: string;
    architectureVisualLabel: string;
    githubCta: string;
    liveDemoCta: string;
    verifiedLabel: string;
    processingLabel: string;
  };
  activity: {
    total: (n: string) => string;
    less: string;
    more: string;
  };
  education: CVEducation[];
  languages: CVLanguage[];
  publications: CVPublication[];
  contact: {
    optionsLabel: string;
    phoneLabel: string;
    emailLabel: string;
    siteLabel: string;
    socialsLabel: string;
    phone: string;
    email: string;
    site: string;
    siteHref: string;
    talkToSeanLabel: string;
    talkToSeanValue: string;
    socialCopy: string;
    socialCopied: string;
    weChat: CVContactWeChat;
    socials: CVSocial[];
  };
  chat: {
    title: string;
    eyebrow: string;
    ready: string;
    replying: string;
    visitor: string;
    assistant: string;
    reset: string;
    backHome: string;
    welcomeTitle: string;
    welcomeBody: string;
    placeholder: string;
    send: string;
    characterCount: (remaining: number) => string;
    shiftEnterTooltip: string;
    starterPrompts: string[];
    magicPrompts: string[];
    errors: Record<string, string>;
  };
  footer: {
    tagline: string;
    author: string;
    madeBy: string;
    madeByHref: string;
  };
};

export const CV_DATA: Record<Locale, CVData> = {
  en: {
    nav: {
      sectionsLabel: "Portfolio sections",
      switchToLightTheme: "Switch to light theme",
      switchToDarkTheme: "Switch to dark theme",
      availability: "Building eval-first Agent / RAG systems",
      downloadCv: "Download CV",
      exploreProjects: "Explore Projects",
      contactMe: "Contact Me",
      scroll: "Scroll",
      timezone: "(UTC+8)",
    },
    hero: {
      availability: "Available for opportunities",
      processingLabel: "Processing",
      verifiedResultLabel: "Verified Result",
      yearsBadge: "Class of '27  ·  CS @ MUC",
      name: "Sean Yu",
      nameLatin: "SEAN YU",
      intent: "Agent / RAG / LLM systems",
      role: "AI-native developer,",
      location:
        "turning LLM demos into traceable, evaluable systems that teams can actually ship.",
      signals: ["Eval-first builder", "Agent workflow engineer", "Product-minded backend"],
      quote:
        "I judge LLM applications on reproducible evals and end-to-end traces, not on gut feel.",
      talkToSean: "Talk to Sean",
      labTitle: "Agent lab notes",
      labSubtitle: "From prompt to trace to measurable behavior.",
      proofPoints: [
        {
          label: "Trace",
          value: "tool calls",
          detail: "structured inputs, observable failures, retry paths",
        },
        {
          label: "Retrieval",
          value: "hybrid RAG",
          detail: "embedding + lexical search, reranking, context control",
        },
        {
          label: "Eval",
          value: "rubrics",
          detail: "case suites, score deltas, reproducible regressions",
        },
      ],
    },
    sections: {
      about: "about",
      skills: "skills",
      projects: "projects",
      activity: "activity",
      education: "education",
      languages: "languages",
      publications: "highlights",
      contact: "contact",
    },
    about: {
      meta: "who I am",
      body:
        "AI Native developer focused on traceable Agent, RAG, and workflow systems. I like the messy middle between product idea and production behavior: prototype -> trace -> evaluate -> harden. That means building quickly, exposing tool calls and context, measuring behavior with evals, then stabilizing the system with Docker, GitHub Actions, and reviewable workflows. I also treat my LLM Wiki as a Content Operating System for turning project work into reusable knowledge assets.",
    },
    skills: [
      {
        group: "Languages & backend",
        items: ["Python", "TypeScript", "FastAPI", "Pydantic", "pytest", "Async I/O / asyncio", "MySQL", "Redis"],
      },
      {
        group: "Frontend & streaming",
        items: ["Next.js", "React", "Vercel AI SDK", "Streaming UI", "Tailwind CSS"],
      },
      {
        group: "LLM & agents",
        items: ["OpenAI API", "multi-model adapters", "tool calling", "structured output", "Agent Loop Design (ReAct, tool orchestration)", "Context Engineering"],
      },
      {
        group: "RAG & retrieval",
        items: ["embeddings", "Qdrant", "Chroma", "hybrid retrieval", "BM25 / RRF", "rerankers", "RAGAS-style eval"],
      },
      {
        group: "Engineering",
        items: ["Docker", "GitHub Actions", "logging & error handling", "Vercel", "remote collaboration"],
      },
    ],
    skillsUi: {
      stackLabel: "Technology stack",
      ecosystemLabel: "Core technology ecosystem",
      cloudVisualLabel: "Interactive technology icon cloud",
      ecosystemDescription: "Activate a technology to trace the capabilities it supports.",
      matrixLabel: "Engineering Capability Matrix",
      matrixDescription: "What these tools become when composed into deliverable systems.",
      verifiedLabel: "Verified capability",
      processingLabel: "Processing",
      activeLabel: "Active",
    },
    capabilities: [
      {
        id: "agent-runtime",
        name: "Agent Runtime",
        description: "Run agents that reason, call tools, and return structured results.",
        technologies: ["OpenAI API", "Tool Calling", "Structured Output", "Pydantic"],
      },
      {
        id: "evaluation",
        name: "Evaluation",
        description: "Measure retrieval, generation quality, and regression across iterations.",
        technologies: ["Golden Set", "Regression Testing", "RAGAS-style eval", "pytest"],
      },
      {
        id: "backend",
        name: "Backend",
        description: "Build typed, asynchronous, and maintainable AI services.",
        technologies: ["FastAPI", "Pydantic", "asyncio", "Streaming UI"],
      },
      {
        id: "infrastructure",
        name: "Infrastructure",
        description: "Create reproducible environments and reliable delivery pipelines.",
        technologies: ["Docker", "Redis", "GitHub Actions", "Vercel"],
      },
      {
        id: "retrieval",
        name: "Retrieval",
        description: "Retrieve and rerank the right context for grounded generation.",
        technologies: ["Qdrant", "BM25 / RRF", "Embeddings", "Rerankers"],
      },
    ],
    projects: {
      emptyState: "No repositories found.",
      updated: "Updated",
      today: "Today",
      yesterday: "Yesterday",
      day: "d",
      week: "w",
      month: "mo",
      ago: " ago",
      noDescription:
        "No description yet. This repository focuses on implementation details and iterative improvements.",
      problemLabel: "Problem",
      architectureLabel: "Architecture",
      stackLabel: "Stack",
      evidenceLabel: "Evidence",
      metricsLabel: "Verified metrics",
      architectureVisualLabel: "System architecture",
      githubCta: "GitHub",
      liveDemoCta: "Live Demo",
      verifiedLabel: "Verified",
      processingLabel: "Processing",
    },
    activity: {
      total: (n) => `${n} contributions in the last 6 months`,
      less: "Less",
      more: "More",
    },
    education: [
      {
        period: "2023 — 2027",
        school: "Minzu University of China",
        title: "B.S. Computer Science and Technology",
        desc:
          "Coursework: data structures, operating systems, computer networks, computer organization, databases, software engineering, natural language processing. GPA 3.6.",
      },
    ],
    languages: [
      { name: "English", level: "IELTS 7.0 · CET-6" },
      { name: "Chinese", level: "Native" },
    ],
    publications: [
      {
        title: "MergeWarden · diff-first context engineering",
        org: "80-line changed-hunk prefetch cut per-file context 95.1% (75,466 -> 3,691 chars) while preserving golden evidence on pytest #7254 and #9350.",
        year: "2026",
        href: "https://merge-warden.vercel.app/",
      },
      {
        title: "MergeWarden · structured output closure",
        org: "Force-submit with tool_choice and thinking-disabled submit paths helped R10 reach 50% hit rate, 0% false positives, and 100% schema validity.",
        year: "2026",
        href: "https://merge-warden.vercel.app/",
      },
      {
        title: "shotgunCV · pipeline-first resume ops",
        org: "Turns one-off resume prompting into a parse -> generate -> score -> rank -> strategy workflow for measurable bulk JD matching decisions.",
        year: "2026",
        href: "https://github.com/takagibit18/shotgunCV",
      },
    ],
    contact: {
      optionsLabel: "Contact options",
      phoneLabel: "Phone",
      emailLabel: "Email",
      siteLabel: "GitHub",
      socialsLabel: "Socials",
      phone: "+86 15061235115",
      email: "huali6641@gmail.com",
      site: "takagibit18",
      siteHref: "https://github.com/takagibit18",
      talkToSeanLabel: "AI profile",
      talkToSeanValue: "Talk to Sean",
      socialCopy: "Copy handle",
      socialCopied: "Handle copied.",
      weChat: {
        modalClose: "Close",
        modalCopy: "Copy WeChat ID",
        modalCopied: "WeChat ID copied.",
        modalCopyFailed: "Copy failed. Select the ID and copy manually.",
        modalQrAlt: "WeChat QR code",
      },
      socials: [
        { label: "GitHub", href: "https://github.com/takagibit18" },
        { label: "WeChat", text: "Sean_Yu3", kind: "wechat" },
        { label: "抖音", text: "Sean的构建日志", kind: "handle" },
        { label: "小红书", text: "Sean的构建日志", kind: "handle" },
        { label: "Twitter", text: "Sean的构建日志", kind: "handle" },
      ],
    },
    chat: {
      title: "Talk to Sean",
      eyebrow: "AI profile assistant",
      ready: "Ready for questions",
      replying: "Sean AI is replying",
      visitor: "Visitor",
      assistant: "Sean AI",
      reset: "Reset",
      backHome: "Back to homepage",
      welcomeTitle: "Ask about Sean's work",
      welcomeBody:
        "This assistant answers from Sean's public profile, projects, and engineering notes.",
      placeholder: "Ask about Sean's agent, RAG, or backend work...",
      send: "Send",
      characterCount: (remaining) => `${remaining} characters left`,
      shiftEnterTooltip: "Shift+Enter inserts a new line",
      starterPrompts: [
        "What kind of LLM systems has Sean built?",
        "Summarize Sean's strongest engineering skills.",
        "How should I evaluate Sean for an agent project?",
      ],
      magicPrompts: [
        "What would Sean ship first on a new AI product team?",
        "How does Sean keep LLM outputs reliable enough for production?",
        "Which project best shows Sean's agent orchestration experience?",
        "What should I ask Sean in a technical interview?",
        "Where has Sean used evaluation to reduce product risk?",
      ],
      errors: {
        MISSING_API_KEY: "Service not configured yet. Please contact the site owner.",
        INVALID_BASE_URL: "Model provider is misconfigured.",
        MODEL_UNAVAILABLE: "AI model is temporarily unavailable.",
        RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
        QUOTA_EXHAUSTED: "Today's public quota is used up. Please try again tomorrow.",
        PROTECTION_MISCONFIGURED: "Public chat protection is not configured yet.",
        FORBIDDEN_ORIGIN: "This chat request is not allowed from that origin.",
        INVALID_MESSAGE: "Please send a non-empty message under 1200 characters.",
        PROVIDER_TIMEOUT: "AI is taking too long. Please try again.",
        default: "Something went wrong. Please try again.",
      },
    },
    footer: {
      tagline: "Eval first. Scale second.",
      author: "Sean Yu",
      madeBy: "Made with care",
      madeByHref: "#",
    },
  },
  zh: {
    nav: {
      sectionsLabel: "主页区块导航",
      switchToLightTheme: "切换到浅色主题",
      switchToDarkTheme: "切换到深色主题",
      availability: "构建评测优先的 Agent / RAG 系统",
      downloadCv: "下载简历",
      exploreProjects: "查看项目",
      contactMe: "联系我",
      scroll: "向下滚动",
      timezone: "(UTC+8)",
    },
    hero: {
      availability: "可接受实习与合作机会",
      processingLabel: "处理中",
      verifiedResultLabel: "已验证结果",
      yearsBadge: "27届 · 中央民大计科",
      name: "欣禹行",
      nameLatin: "XIN YUXING",
      intent: "Agent / RAG / LLM 系统",
      role: "AI-native 开发者，",
      location: "把 LLM Demo 打磨成可追踪、可评测、真正能上线的系统。",
      signals: ["评测优先的构建者", "Agent 工作流工程", "懂产品的后端实现"],
      quote:
        "对大模型应用的判断，我坚持以可复现的评测与端到端链路为依据，而不是依赖主观感觉。",
      talkToSean: "和 Sean 聊聊",
      labTitle: "Agent 工程笔记",
      labSubtitle: "从提示词到链路追踪，再到可衡量行为。",
      proofPoints: [
        {
          label: "Trace",
          value: "工具调用",
          detail: "结构化输入、失败可观测、重试路径",
        },
        {
          label: "Retrieval",
          value: "混合 RAG",
          detail: "向量 + 关键词检索、重排、上下文控制",
        },
        {
          label: "Eval",
          value: "评分规约",
          detail: "用例集、分数变化、可复现回归",
        },
      ],
    },
    sections: {
      about: "关于",
      skills: "技能",
      projects: "项目",
      activity: "活跃度",
      education: "教育",
      languages: "语言",
      publications: "项目亮点",
      contact: "联系",
    },
    about: {
      meta: "个人简介",
      body:
        "AI Native 开发者，专注可追踪的 Agent、RAG 与 Workflow 系统。我喜欢产品想法到生产行为之间那段最混乱、也最有价值的中间地带：原型 -> 追踪 -> 评测 -> 打磨。先快速构建，再暴露工具调用与上下文，用评测度量行为，最后通过 Docker、GitHub Actions 和可 review 的流程稳定系统。我也把 LLM Wiki 视为内容操作系统，用来把项目实践沉淀成可复用知识资产。",
    },
    skills: [
      {
        group: "编程与后端",
        items: ["Python", "TypeScript", "FastAPI", "Pydantic", "pytest", "Async I/O / asyncio", "MySQL", "Redis"],
      },
      {
        group: "前端与流式体验",
        items: ["Next.js", "React", "Vercel AI SDK", "Streaming UI", "Tailwind CSS"],
      },
      {
        group: "LLM 与 Agent",
        items: ["OpenAI API", "多模型适配", "Tool Calling", "结构化输出", "Agent Loop Design (ReAct, tool orchestration)", "上下文工程"],
      },
      {
        group: "RAG 与检索",
        items: ["Embedding 选型", "Qdrant", "Chroma", "混合检索", "BM25 / RRF", "Reranker", "RAGAS 评测"],
      },
      {
        group: "工程化",
        items: ["Docker", "GitHub Actions", "日志与错误处理", "Vercel", "远程协作"],
      },
    ],
    skillsUi: {
      stackLabel: "技术栈分类",
      ecosystemLabel: "核心技术生态",
      cloudVisualLabel: "交互式技术图标云",
      ecosystemDescription: "激活技术节点，查看它支撑的工程能力。",
      matrixLabel: "工程能力矩阵",
      matrixDescription: "这些工具组合后能够交付的系统能力。",
      verifiedLabel: "已验证能力",
      processingLabel: "处理中",
      activeLabel: "已激活",
    },
    capabilities: [
      {
        id: "agent-runtime",
        name: "Agent 运行时",
        description: "让 Agent 完成推理、工具调用并返回结构化结果。",
        technologies: ["OpenAI API", "Tool Calling", "Structured Output", "Pydantic"],
      },
      {
        id: "evaluation",
        name: "评测",
        description: "衡量检索、生成质量与多次迭代之间的回归变化。",
        technologies: ["Golden Set", "Regression Testing", "RAGAS 风格评测", "pytest"],
      },
      {
        id: "backend",
        name: "后端",
        description: "构建类型安全、异步且可维护的 AI 服务。",
        technologies: ["FastAPI", "Pydantic", "asyncio", "Streaming UI"],
      },
      {
        id: "infrastructure",
        name: "基础设施",
        description: "建立可复现环境与可靠的交付流水线。",
        technologies: ["Docker", "Redis", "GitHub Actions", "Vercel"],
      },
      {
        id: "retrieval",
        name: "检索",
        description: "检索并重排正确上下文，让生成结果有事实依据。",
        technologies: ["Qdrant", "BM25 / RRF", "Embedding", "Reranker"],
      },
    ],
    projects: {
      emptyState: "暂无可展示仓库。",
      updated: "更新于",
      today: "今天",
      yesterday: "昨天",
      day: "天",
      week: "周",
      month: "个月",
      ago: "前",
      noDescription: "暂无描述，该仓库当前主要用于功能迭代与实现细节更新。",
      problemLabel: "问题",
      architectureLabel: "架构",
      stackLabel: "技术栈",
      evidenceLabel: "证据",
      metricsLabel: "可验证指标",
      architectureVisualLabel: "系统架构",
      githubCta: "GitHub",
      liveDemoCta: "在线演示",
      verifiedLabel: "已验证",
      processingLabel: "处理中",
    },
    activity: {
      total: (n) => `过去半年共 ${n} 次贡献`,
      less: "少",
      more: "多",
    },
    education: [
      {
        period: "2023 — 2027",
        school: "中央民族大学",
        title: "计算机科学与技术 · 本科",
        desc:
          "核心课程：数据结构、操作系统、计算机网络、计算机组成原理、数据库系统、软件工程、自然语言处理等。GPA 3.6。",
      },
    ],
    languages: [
      { name: "英语", level: "IELTS 7.0 · CET-6" },
      { name: "中文", level: "母语" },
    ],
    publications: [
      {
        title: "MergeWarden · diff-first 上下文工程",
        org: "围绕 changed hunk 的 80 行预读窗口，将单文件上下文减少 95.1%（75,466 -> 3,691 字符），同时保留 pytest #7254 与 #9350 的 golden 证据。",
        year: "2026",
        href: "https://merge-warden.vercel.app/",
      },
      {
        title: "MergeWarden · 结构化输出闭环",
        org: "通过 tool_choice 与 thinking-disabled submit 路径强制 force-submit，R10 达到 50% hit rate、0% false positives 和 100% schema validity。",
        year: "2026",
        href: "https://github.com/takagibit18/MergeWarden",
      },
      {
        title: "shotgunCV · Pipeline-first 简历工作流",
        org: "把一次性简历提示词改造成解析 -> 生成 -> 评分 -> 排序 -> 策略工作流，让批量 JD 匹配决策变得可度量。",
        year: "2026",
        href: "https://github.com/takagibit18/shotgunCV",
      },
    ],
    contact: {
      optionsLabel: "联系方式",
      phoneLabel: "电话",
      emailLabel: "邮箱",
      siteLabel: "GitHub",
      socialsLabel: "社交",
      phone: "+86 15061235115",
      email: "huali6641@gmail.com",
      site: "takagibit18",
      siteHref: "https://github.com/takagibit18",
      talkToSeanLabel: "AI 个人档案",
      talkToSeanValue: "和 Sean 的 AI 分身聊聊",
      socialCopy: "复制账号",
      socialCopied: "已复制账号。",
      weChat: {
        modalClose: "关闭",
        modalCopy: "复制微信号",
        modalCopied: "已复制微信号。",
        modalCopyFailed: "复制失败，请手动选择并复制。",
        modalQrAlt: "微信二维码",
      },
      socials: [
        { label: "GitHub", href: "https://github.com/takagibit18" },
        { label: "微信", text: "Sean_Yu3", kind: "wechat" },
        { label: "抖音", text: "Sean的构建日志", kind: "handle" },
        { label: "小红书", text: "Sean的构建日志", kind: "handle" },
        { label: "Twitter", text: "Sean的构建日志", kind: "handle" },
      ],
    },
    chat: {
      title: "和 Sean 聊聊",
      eyebrow: "AI 个人档案助手",
      ready: "可以开始提问",
      replying: "Sean AI 正在回复",
      visitor: "访客",
      assistant: "Sean AI",
      reset: "重置",
      backHome: "返回主页",
      welcomeTitle: "了解 Sean 的工作",
      welcomeBody: "这个助手会基于 Sean 的公开主页、项目和工程笔记回答。",
      placeholder: "询问 Sean 的 Agent、RAG 或后端工程经历...",
      send: "发送",
      characterCount: (remaining) => `还可输入 ${remaining} 个字符`,
      shiftEnterTooltip: "Shift+Enter 插入换行",
      starterPrompts: [
        "Sean 做过哪些 LLM 系统？",
        "总结 Sean 最强的工程能力。",
        "如何评估 Sean 是否适合 Agent 项目？",
      ],
      magicPrompts: [
        "Sean 加入一个新的 AI 产品团队后会先交付什么？",
        "Sean 如何把 LLM 输出稳定到可上线的程度？",
        "哪个项目最能体现 Sean 的 Agent 编排经验？",
        "技术面试里最应该问 Sean 什么？",
        "Sean 在哪些地方用评测降低了产品风险？",
      ],
      errors: {
        MISSING_API_KEY: "服务暂未配置。请联系站点所有者。",
        INVALID_BASE_URL: "模型服务配置错误。",
        MODEL_UNAVAILABLE: "AI 模型暂时不可用。",
        RATE_LIMITED: "请求过快，请稍后再试。",
        QUOTA_EXHAUSTED: "今天的公开额度已用完，请明天再试。",
        PROTECTION_MISCONFIGURED: "公开聊天保护尚未配置。",
        FORBIDDEN_ORIGIN: "该聊天请求不允许来自该来源。",
        INVALID_MESSAGE: "请发送 1200 字以内的非空消息。",
        PROVIDER_TIMEOUT: "AI 回复时间过长，请重试。",
        default: "发生错误，请稍后重试。",
      },
    },
    footer: {
      tagline: "评测先行，再谈规模。",
      author: "欣禹行",
      madeBy: "用心打造",
      madeByHref: "#",
    },
  },
};
