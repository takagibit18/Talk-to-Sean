export const profileContent = {
  hero: {
    availability: "Building eval-first Agent / RAG systems",
    name: "Sean Yu",
    nameLatin: "SEAN YU",
    intent: "Agent / RAG / LLM systems",
    intro:
      "AI-native developer, combining product taste with engineering discipline to turn LLM ideas into traceable, evaluable systems.",
    quote:
      "I judge LLM applications on reproducible evals and end-to-end traces, not on gut feel.",
    labTitle: "Agent lab notes",
    labSubtitle: "From prompt to trace to measurable behavior.",
    proofPoints: [
      {
        label: "Trace",
        value: "tool calls",
        detail: "structured inputs, observable failures, retry paths"
      },
      {
        label: "Retrieval",
        value: "hybrid RAG",
        detail: "embedding + lexical search, reranking, context control"
      },
      {
        label: "Eval",
        value: "rubrics",
        detail: "case suites, score deltas, reproducible regressions"
      }
    ]
  },
  chat: {
    title: "Talk to Sean AI",
    subtitle:
      "Ask about Sean's projects, technical direction, education, contact paths, and collaboration fit.",
    welcome:
      "Hi, I am Sean AI. I can answer questions about Sean's public profile, projects, technical skills, and collaboration paths. Ask in English or Chinese.",
    starters: [
      "What university did Sean attend?",
      "Tell me about Sean's agent and RAG projects.",
      "How can I contact Sean?",
      "What makes Sean an AI-native developer?"
    ],
    disclaimer:
      "Public anonymous MVP. Answers are AI-generated from Sean-approved profile and wiki material; missing facts are treated as unknown."
  },
  about: {
    label: "about",
    meta: "who I am",
    body:
      "CS undergraduate at Minzu University of China (985), expected to graduate in 2027. I build LLM-backed services with Python, FastAPI, Pydantic, async patterns, MySQL, and Redis. I care about prompt design, structured outputs, tool calling, retrieval quality, and agent orchestration. My default loop is prototype, trace, evaluate, then harden the system with Docker, GitHub Actions, and reviewable open-source workflows."
  },
  skills: [
    {
      group: "Languages & backend",
      items: ["Python", "FastAPI", "Pydantic", "pytest", "async I/O", "MySQL", "Redis"]
    },
    {
      group: "LLM & agents",
      items: [
        "OpenAI API",
        "prompt engineering",
        "tool calling",
        "structured output",
        "LangChain",
        "agent workflows"
      ]
    },
    {
      group: "RAG & retrieval",
      items: ["embeddings", "vector databases", "hybrid retrieval", "rerankers", "RAGAS-style eval"]
    },
    {
      group: "Engineering",
      items: ["Docker", "GitHub Actions", "logging", "error handling", "remote collaboration", "deployment"]
    }
  ],
  projects: [
    {
      title: "shotgunCV",
      href: "https://github.com/takagibit18/shotgunCV",
      language: "Python",
      description:
        "A pipeline-first AI Resume Ops project for high-volume applications. It batches JD parsing, generates resume variants, scores and ranks them, and outputs application strategy.",
      problem:
        "Bulk applications make resume tailoring repetitive and hard to compare objectively.",
      architecture:
        "JD parser -> resume variant generator -> scoring/ranking loop -> application strategy output.",
      evidence:
        "Shows an eval-oriented pipeline, not a one-off prompt wrapper.",
      stack: ["Python", "LLM API", "Pipeline", "Scoring"]
    },
    {
      title: "Mergewarden",
      href: "https://github.com/takagibit18/MergeWarden",
      language: "Python",
      description:
        "An LLM-powered code review and debugging assistant for teams and local pipelines. It turns diffs and failure signals into graded review findings and verifiable debugging steps.",
      problem:
        "Review feedback and CI failures are noisy unless they become ranked, reproducible engineering actions.",
      architecture:
        "Diff and failure ingestion -> LLM review rubric -> graded findings -> reproducible debug plan.",
      evidence:
        "Connects agent reasoning with review severity, containers, and CI handoff.",
      stack: ["Python", "FastAPI", "LangChain", "Docker", "CI"]
    }
  ],
  education: {
    label: "education",
    period: "2023 - 2027",
    school: "Minzu University of China",
    title: "B.S. Computer Science and Technology",
    description:
      "Coursework: data structures, operating systems, computer networks, computer organization, databases, software engineering, and natural language processing. Public GPA: 3.6."
  },
  languages: [
    { name: "English", level: "IELTS 7.0 / CET-6" },
    { name: "Chinese", level: "Native" }
  ],
  contact: {
    email: "huali6641@gmail.com",
    github: "https://github.com/takagibit18",
    githubLabel: "takagibit18",
    wechat: "Sean_Yu3",
    cvHref: "/cv.pdf"
  }
} as const;

export type ProjectProfile = (typeof profileContent.projects)[number];
