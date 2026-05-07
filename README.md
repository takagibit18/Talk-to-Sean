# Talk to Sean

面向 Sean Yu 个人主页访客的公开匿名 AI 聊天机器人。访客可自由提问 Sean 的项目经历、技术方向、能力边界与合作方式，AI 基于精选维护的知识库给出保守、真实的回答。

## 功能特性

- **公开匿名访问**：无需登录、无需邀请码，打开即用
- **中英双语对话**：根据访客提问语言自动切换回答语言，中文优先
- **流式响应**：服务端实时流式输出，低延迟交互体验
- **Markdown 渲染**：客户端内联解析 Markdown（标题、列表、粗体、代码、链接），无外部依赖
- **知识库驱动**：基于 Karpathy LLM Wiki 模式，回答严格限定在已审核的知识范围内
- **保守回答策略**：缺失信息如实告知"资料库未收录该细节"，不编造、不推测
- **AI 声明**：界面明确标注回答由 AI 生成

## 技术架构

```
访客浏览器                    Vercel (Node.js)               AI 服务商
    │                              │                              │
    ├── / ──→ Landing Page         │                              │
    ├── /chat ──→ ChatShell (CSR)  │                              │
    │                              │                              │
    ├── POST /api/chat ──────────→ │                              │
    │   useChat (@ai-sdk/react)    ├── chat-policy.ts (校验)     │
    │                              ├── model-provider.ts (SDK)   │
    │                              ├── prompt.ts (系统提示词)     │
    │                              ├── wiki-context.ts (知识库)   │
    │                              ├── streamText() ────────────→ │
    │   ← SSE stream ──────────── │ ←  ←  ←  ←  ←  ←  ←  ←  ← │
    │                              │                              │
    ▼                              ▼                              ▼
  React 渲染                    Next.js API Route            OpenAI API
  MarkdownPreview                (App Router)               (兼容 DeepSeek 等)
```

### 请求处理流程

1. 访客在 `/chat` 页面输入消息，`useChat`（来自 `@ai-sdk/react`）发起 POST 请求至 `/api/chat`
2. `chat-policy.ts` 校验消息数组：最多 24 条消息、总文本不超过 12000 字符、角色限 system/user/assistant
3. `model-provider.ts` 从环境变量读取 API Key、模型名称和 Base URL，创建 OpenAI 兼容 Provider
4. `wiki-context.ts` 按固定顺序读取 7 个 Wiki Markdown 文件，打包为确定性上下文块
5. `prompt.ts` 组装系统提示词：身份边界 + 知识策略 + 语言策略 + 完整 Wiki 上下文
6. `streamText()` 调用 AI 模型，流式返回生成结果

### 关键设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 知识检索 | LLM Wiki 文件直接注入系统提示词 | 知识量可控（< 50KB），无需 RAG/向量数据库的额外复杂度 |
| 框架 | Next.js App Router | 支持 Server Component + API Route 同仓部署 |
| AI SDK | Vercel AI SDK v6 | 统一 `useChat` 客户端 Hook 与 `streamText` 服务端 API |
| 样式 | 纯 CSS（单一文件，~800 行） | 无组件库依赖，产物体积最小化 |
| 状态管理 | 无全局状态库 | 聊天状态由 `useChat` Hook 管理，页面状态由 React 组件树管理 |
| 认证 | 无 | 公开信息型聊天机器人，无需登录 |

## 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 框架 | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| 语言 | TypeScript | 6.x |
| AI SDK | `ai` / `@ai-sdk/react` / `@ai-sdk/openai` | 6.x / 3.x |
| 图标 | lucide-react | 1.x |
| 样式 | 纯 CSS (CSS Custom Properties) | — |
| 测试 | Vitest + @testing-library/react + jsdom | 4.x |
| 部署 | Vercel | — |
| 运行时 | Node.js | — |

## 知识系统

本项目采用 **Karpathy LLM Wiki** 模式管理 Sean 的公开信息，数据分为三层：

```
knowledge/
├── raw/                    ← 原始资料（不可变来源）
│   └── homepage.md
├── wiki/                   ← 维护后的 Wiki 页面（运行时上下文）
│   ├── index.md            — Wiki 索引与定位
│   ├── sean.md             — 公开档案（教育、语言、优势、联系方式）
│   ├── projects.md         — 项目经验（shotgunCV、Mergewarden）
│   ├── capabilities.md     — 技术能力
│   ├── interview-qa.md     — 50 题面试问答库
│   ├── voice.md            — 表达风格与语气规则
│   └── boundaries.md       — 隐私边界与回答范围限制
└── SCHEMA.md               — 维护规范
```

**维护规则：**
- 新事实先进入 `raw/`，经审核后更新到 `wiki/`
- `wiki-context.ts` 在每次请求时同步读取全部 Wiki 文件，组装为确定性上下文
- 不在此知识范围内的信息，AI 会明确告知"资料库未收录"，不会凭空编造
- 联系方式仅开放 `huali6641@gmail.com`，**绝不暴露手机号码**

**为什么不使用 RAG / 向量数据库：** 当前知识总量约 50KB，直接放入系统提示词比引入嵌入模型、向量存储和检索管道更简单、更快、更可解释。每次更新 Wiki 文件后立刻生效，无需重建索引。

## 项目结构

```
├── app/
│   ├── globals.css              # 全局样式（CSS 变量、布局、Markdown 渲染）
│   ├── layout.tsx               # 根布局，设置页面元数据
│   ├── page.tsx                 # 首页入口 → <LandingPage />
│   ├── api/chat/route.ts        # POST /api/chat — 流式聊天 API
│   └── chat/page.tsx            # /chat 页面入口 → <ChatShell />
├── components/
│   ├── landing-page.tsx         # 落地页（英雄区、聊天预览卡、信息卡片）
│   └── chat-shell.tsx           # 聊天界面（消息列表、输入框、Markdown 渲染）
├── lib/
│   ├── chat-policy.ts           # 消息校验（条数、角色、文本长度限制）
│   ├── model-provider.ts        # OpenAI SDK Provider 工厂
│   ├── prompt.ts                # 系统提示词组装
│   ├── sean-profile.ts          # 兼容层（历史数据桥接）
│   └── wiki-context.ts          # Wiki 文件读取与上下文打包
├── knowledge/
│   ├── raw/                     # 原始资料
│   ├── wiki/                    # Wiki 页面
│   └── SCHEMA.md                # 维护规范
├── tests/                       # 测试文件
├── vercel.json                  # Vercel 部署配置
└── vitest.config.ts             # Vitest 配置
```

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
```

编辑 `.env.local`：

```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5-mini
OPENAI_BASE_URL=                # 可选，默认 OpenAI；切换 DeepSeek 等兼容服务时填写
```

```bash
# 启动开发服务器
npm run dev
# → http://localhost:3000

# 类型检查
npm run typecheck

# 构建
npm run build

# 运行测试
npm test
```

## 部署

项目部署于 **Vercel**（`vercel.json` 中配置 `framework: "nextjs"`）。

需要在 Vercel 项目设置中配置以下环境变量：

| 变量 | 说明 | 必填 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI 兼容 API Key | 是 |
| `OPENAI_MODEL` | 模型名称，默认 `gpt-5-mini` | 否 |
| `OPENAI_BASE_URL` | API Base URL，默认 OpenAI 官方地址 | 否 |

> 使用 DeepSeek 等兼容服务时，设置 `OPENAI_MODEL` 为对应模型名，`OPENAI_BASE_URL` 为服务的兼容地址即可。

## 测试

```bash
npm test                 # 运行全部测试
npx vitest run           # 等效
```

测试覆盖：

| 测试文件 | 范围 |
|----------|------|
| `tests/landing-page.test.tsx` | 落地页文案、链接地址 |
| `tests/chat-shell.test.tsx` | Enter/Shift+Enter 发送逻辑、Markdown 块渲染 |
| `tests/chat-route.test.ts` | 聊天页面文件存在性 |
| `tests/model-provider.test.ts` | 环境变量解析、Base URL 校验、错误处理 |
| `tests/prompt.test.ts` | 系统提示词包含 Wiki 事实、排除手机号码、保守回答规则 |
| `tests/wiki-context.test.ts` | Wiki 文件列表正确性、上下文内容校验 |

## 仓库

https://github.com/takagibit18/Talk-to-Sean
