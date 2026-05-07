# Talk to Sean

A public anonymous AI chatbot for visitors arriving from Sean Yu's personal homepage. Visitors can ask about Sean's project experience, technical direction, capabilities, and collaboration preferences — the AI answers conservatively and truthfully based on a curated knowledge base.

## Features

- **Public anonymous access**: No login, no invite code — open immediately
- **Bilingual conversation**: Automatically switches between Chinese and English based on the visitor's input language, Chinese-first
- **Streaming responses**: Server-side real-time streaming with low-latency interaction
- **Markdown rendering**: Client-side inline Markdown parsing (headings, lists, bold, code, links) with zero external dependencies
- **Knowledge-base driven**: Uses the Karpathy LLM Wiki pattern — answers are strictly grounded in reviewed knowledge
- **Conservative answering**: When details are missing, the bot honestly states "the wiki does not include that detail" — no fabrication, no speculation
- **AI disclosure**: The UI clearly labels responses as AI-generated

## Architecture

```
Visitor Browser                Vercel (Node.js)               AI Provider
    │                              │                              │
    ├── / ──→ Landing Page         │                              │
    ├── /chat ──→ ChatShell (CSR)  │                              │
    │                              │                              │
    ├── POST /api/chat ──────────→ │                              │
    │   useChat (@ai-sdk/react)    ├── chat-policy.ts (validate)  │
    │                              ├── model-provider.ts (SDK)    │
    │                              ├── prompt.ts (system prompt)  │
    │                              ├── wiki-context.ts (knowledge)│
    │                              ├── streamText() ────────────→ │
    │   ← SSE stream ──────────── │ ←  ←  ←  ←  ←  ←  ←  ←  ← │
    │                              │                              │
    ▼                              ▼                              ▼
  React render                 Next.js API Route            OpenAI API
  MarkdownPreview              (App Router)              (DeepSeek-compatible)
```

### Request processing pipeline

1. Visitor types a message on `/chat`; `useChat` (from `@ai-sdk/react`) POSTs to `/api/chat`
2. `chat-policy.ts` validates the message array: max 24 messages, 12,000 characters of text, allowed roles `system|user|assistant`
3. `model-provider.ts` reads API key, model name, and base URL from environment variables, creates an OpenAI-compatible provider
4. `wiki-context.ts` reads 7 Wiki Markdown files in a fixed order, bundles them into a deterministic context block
5. `prompt.ts` assembles the system prompt: identity boundary + knowledge policy + language policy + full wiki context
6. `streamText()` calls the AI model and streams the generated response

### Key design decisions

| Decision | Approach | Rationale |
|----------|----------|-----------|
| Knowledge retrieval | LLM Wiki files injected directly into system prompt | Manageable knowledge size (< 50KB); no RAG/vector DB complexity needed |
| Framework | Next.js App Router | Co-located Server Components and API Routes |
| AI SDK | Vercel AI SDK v6 | Unified `useChat` client hook and `streamText` server API |
| Styling | Plain CSS (single file, ~800 lines) | No component library dependency, minimal bundle size |
| State management | No global state library | Chat state managed by `useChat` hook; page state managed by React tree |
| Authentication | None | Public information chatbot, no login required |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Language | TypeScript | 6.x |
| AI SDK | `ai` / `@ai-sdk/react` / `@ai-sdk/openai` | 6.x / 3.x |
| Icons | lucide-react | 1.x |
| Styling | Plain CSS (CSS Custom Properties) | — |
| Testing | Vitest + @testing-library/react + jsdom | 4.x |
| Deployment | Vercel | — |
| Runtime | Node.js | — |

## Knowledge System

This project uses the **Karpathy LLM Wiki** pattern to manage Sean's public information, organized in three layers:

```
knowledge/
├── raw/                    ← Raw source material (immutable)
│   └── homepage.md
├── wiki/                   ← Maintained wiki pages (runtime context)
│   ├── index.md            — Wiki index and positioning
│   ├── sean.md             — Public profile (education, languages, strengths, contact)
│   ├── projects.md         — Project experience (shotgunCV, Mergewarden)
│   ├── capabilities.md     — Technical capabilities
│   ├── interview-qa.md     — 50-question interview bank
│   ├── voice.md            — Tone, style, and first-person rules
│   └── boundaries.md       — Privacy boundaries and answer scope limits
└── SCHEMA.md               — Maintenance conventions
```

**Maintenance rules:**
- New facts enter `raw/` first; after review, update to `wiki/`
- `wiki-context.ts` reads all Wiki files synchronously on each request, assembling a deterministic context
- For information outside this knowledge scope, the AI explicitly states "not in the wiki" rather than fabricating
- Contact information is limited to `huali6641@gmail.com`; **phone numbers are never exposed**

**Why not RAG / vector databases:** The current knowledge base is approximately 50KB. Injecting it directly into the system prompt is simpler, faster, and more interpretable than introducing embedding models, vector stores, and retrieval pipelines. Wiki file updates take effect immediately without reindexing.

## Project Structure

```
├── app/
│   ├── globals.css              # Global styles (CSS variables, layout, Markdown rendering)
│   ├── layout.tsx               # Root layout with page metadata
│   ├── page.tsx                 # Home page entry → <LandingPage />
│   ├── api/chat/route.ts        # POST /api/chat — streaming chat API
│   └── chat/page.tsx            # /chat page entry → <ChatShell />
├── components/
│   ├── landing-page.tsx         # Landing page (hero, chat preview card, info cards)
│   └── chat-shell.tsx           # Chat interface (message list, composer, Markdown renderer)
├── lib/
│   ├── chat-policy.ts           # Message validation (count, roles, text length limits)
│   ├── model-provider.ts        # OpenAI SDK provider factory
│   ├── prompt.ts                # System prompt assembly
│   ├── sean-profile.ts          # Compatibility layer (legacy data bridge)
│   └── wiki-context.ts          # Wiki file reading and context bundling
├── knowledge/
│   ├── raw/                     # Raw source material
│   ├── wiki/                    # Wiki pages
│   └── SCHEMA.md                # Maintenance conventions
├── tests/                       # Test files
├── vercel.json                  # Vercel deployment config
└── vitest.config.ts             # Vitest configuration
```

## Local Development

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Edit `.env.local`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5-mini
OPENAI_BASE_URL=                # Optional, defaults to OpenAI; set for DeepSeek or compatible providers
```

```bash
# Start dev server
npm run dev
# → http://localhost:3000

# Type check
npm run typecheck

# Build
npm run build

# Run tests
npm test
```

## Deployment

Deployed on **Vercel** (`vercel.json` configured with `framework: "nextjs"`).

Set these environment variables in the Vercel project settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI-compatible API key | Yes |
| `OPENAI_MODEL` | Model name, defaults to `gpt-5-mini` | No |
| `OPENAI_BASE_URL` | API base URL, defaults to OpenAI official | No |

> For DeepSeek or similar compatible services, set `OPENAI_MODEL` to the provider's model name and `OPENAI_BASE_URL` to their compatible endpoint.

## Tests

```bash
npm test                 # Run all tests
npx vitest run           # Equivalent
```

Test coverage:

| Test file | Scope |
|-----------|-------|
| `tests/landing-page.test.tsx` | Landing page copy, link targets |
| `tests/chat-shell.test.tsx` | Enter/Shift+Enter send logic, Markdown block rendering |
| `tests/chat-route.test.ts` | Chat page file existence |
| `tests/model-provider.test.ts` | Env var parsing, base URL validation, error handling |
| `tests/prompt.test.ts` | System prompt contains wiki facts, excludes phone number, conservative answer rules |
| `tests/wiki-context.test.ts` | Wiki file list correctness, context content validation |

## Repository

https://github.com/takagibit18/Talk-to-Sean
