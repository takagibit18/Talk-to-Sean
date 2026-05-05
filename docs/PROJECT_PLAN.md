# Talk to Sean Project Plan

## Decision

Use option A as the deployment shape: a standalone Vercel chatbot app linked from the existing domestic personal homepage.

Reason: the current homepage is an ICP-filed personal website on Alibaba Cloud. Keeping the chatbot outside that deployed site reduces the chance that an interactive generative AI feature is treated as part of the ICP-filed personal homepage.

## MVP

Goal: ship a public anonymous chatbot that can answer visitors as Sean's public AI representative.

Core knowledge pattern: Karpathy LLM Wiki pattern. The project will not use embedding-based RAG or runtime skills. Instead, Sean's public source material is curated into immutable raw markdown files, then compiled into a maintained markdown wiki that the chatbot loads as its trusted answer context.

Build:

- Next.js App Router application.
- `/api/chat` route that streams model output.
- Vercel AI SDK chat UI.
- OpenAI model configured by environment variable.
- Local LLM Wiki files for Sean's public facts, projects, biography, communication style, boundaries, and source-backed summaries.
- Conservative prompt rules that require the model to answer from the compiled wiki and refuse to invent personal claims.
- README and deployment documentation.

Out of scope:

- Login or access code.
- Conversation storage.
- Admin dashboard.
- Analytics.
- Embedding-based RAG, vector databases, document chunk retrieval, or query-time source rediscovery.
- Runtime skills or agent tool modules for answering visitors.
- Domestic-site embedding.

## Knowledge Architecture

The project follows the Karpathy LLM Wiki pattern:

1. Raw sources: immutable Sean-approved source documents, such as public bio notes, project descriptions, writing samples, homepage copy, FAQ drafts, and contact preferences.
2. Wiki: LLM-maintained markdown pages that compile those sources into stable public facts, topic pages, style notes, and answer boundaries.
3. Schema: a local convention document that tells maintainers how to ingest sources, update wiki pages, cite raw sources, lint contradictions, and prepare the context bundle used by the chatbot.

For the web app, the wiki is the runtime knowledge source. The app should load a small, curated context bundle from the wiki into the system prompt. It should not search a vector database or call a skill/tool at answer time.

Planned repository shape:

```text
knowledge/
  SCHEMA.md
  raw/
    sean-bio.md
    projects.md
    voice-and-style.md
    contact.md
  wiki/
    index.md
    log.md
    sean.md
    projects.md
    voice.md
    boundaries.md
```

Operating loop:

- Ingest: add or revise a raw source, then update the relevant wiki pages and append to `knowledge/wiki/log.md`.
- Query preparation: compile selected wiki pages into a deterministic prompt context used by `/api/chat`.
- Lint: periodically check for contradictions, stale claims, orphan pages, missing source references, and facts that are present in raw sources but absent from the wiki.

## MVP+ Candidate Work

- Add a simple access code or signed link.
- Add rate limiting and abuse controls.
- Add conversation analytics without storing sensitive chat content by default.
- Add structured profile sections for projects, timeline, capabilities, writing, and contact preferences.
- Add an automated wiki compiler script that validates links and emits the prompt context bundle from `knowledge/wiki/index.md`.
- Add wiki lint checks for contradiction detection, missing source references, and stale facts.
- Add bilingual answer-quality tests.
- Add a visual design pass based on the existing personal homepage style.

## Compliance Posture

- The ICP-filed domestic homepage should show a normal external link or button to the Vercel app.
- Do not iframe the chatbot into the domestic homepage for the MVP.
- Do not collect unnecessary personal data.
- Add a visible note in a later release that the chatbot is AI-generated and may be inaccurate.
- Reassess compliance before adding persistence, analytics, user accounts, or public launch marketing.

## Deployment Flow

1. Push this repository to `https://github.com/takagibit18/Talk-to-Sean`.
2. Import the repository in Vercel.
3. Set `OPENAI_API_KEY` and `OPENAI_MODEL` in Vercel project settings.
4. Deploy production.
5. Add a button on the existing personal homepage that links to the Vercel production URL.

## Quality Gates

- `npm run typecheck` passes.
- `npm run build` passes.
- Chat UI loads on desktop and mobile widths.
- `/api/chat` returns a streamed response when `OPENAI_API_KEY` is configured.
- The bot refuses to invent missing facts about Sean.
