# Talk to Sean MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone public anonymous chatbot that visitors can open from Sean's personal homepage.

**Architecture:** Next.js App Router serves the chat UI and an `/api/chat` route. Vercel AI SDK streams responses from OpenAI. Sean-specific behavior is controlled by a Karpathy LLM Wiki pattern: immutable raw markdown sources compile into maintained wiki pages, and the chatbot answers from a deterministic wiki context bundle. No embedding-based RAG, vector database, or runtime skills are used.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vercel AI SDK 6, `@ai-sdk/openai`, Vercel.

---

## File Map

- `package.json`: project scripts and dependency pins.
- `app/layout.tsx`: root metadata and global CSS import.
- `app/page.tsx`: page composition.
- `components/chat-shell.tsx`: client chat interface.
- `app/api/chat/route.ts`: server-side streaming chat endpoint.
- `lib/chat-policy.ts`: incoming message validation.
- `lib/sean-profile.ts`: Sean public profile facts and response constraints.
- `lib/prompt.ts`: prompt construction.
- `knowledge/SCHEMA.md`: rules for maintaining the LLM Wiki.
- `knowledge/raw/*.md`: immutable source notes approved by Sean.
- `knowledge/wiki/*.md`: compiled public wiki pages used for answer grounding.
- `docs/PROJECT_PLAN.md`: product roadmap and deployment plan.

## Tasks

- [ ] Install dependencies with `npm install`.
- [ ] Run `npm run typecheck` and fix TypeScript issues.
- [ ] Run `npm run build` and fix production build issues.
- [ ] Add the initial `knowledge/` LLM Wiki directory with raw sources, wiki pages, index, log, and schema.
- [ ] Update prompt assembly so Sean answers from the compiled wiki context, not from ad hoc profile constants.
- [ ] Keep `lib/sean-profile.ts` only as a compatibility bridge or replace it with a wiki context loader.
- [ ] Create `.env.local` from `.env.example`.
- [ ] Add a real `OPENAI_API_KEY`.
- [ ] Run `npm run dev`.
- [ ] Open `http://localhost:3000` and send a smoke-test message.
- [ ] Ask for a missing fact about Sean and verify the bot says the compiled wiki does not include that detail.
- [ ] Replace starter raw/wiki facts with Sean-approved public details.
- [ ] Push to GitHub and import the repo into Vercel.
- [ ] Add `OPENAI_API_KEY` and `OPENAI_MODEL` in Vercel.
- [ ] Deploy production and link the production URL from Sean's personal homepage.
