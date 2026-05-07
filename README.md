# Talk to Sean

Talk to Sean is the overseas version of Sean Yu's personal homepage: a portfolio page with an embedded public-profile chatbot. The domestic homepage can remain a static ICP filing entry, while this repository owns the Vercel runtime experience for international visitors.

## Product Shape

- `/` renders the complete overseas homepage: Hero, embedded chat, About, Skills, Projects, Education, and Contact.
- `/chat` keeps a full-screen chat route for deeper conversations and mobile use.
- `/api/chat` calls the model provider from the server, so browser code never receives the model API key.
- The chatbot answers from the curated `knowledge/wiki` files and should refuse or narrow unrelated requests.
- Owner-provided API is the default user experience. BYOK is only a future fallback for self-hosting or quota exhaustion.

## Architecture

```text
Visitor browser
  -> Next.js homepage / chat UI
  -> POST /api/chat
  -> chat-policy.ts validation and rate limit
  -> prompt.ts + wiki-context.ts
  -> Vercel AI SDK streamText()
  -> OpenAI-compatible model provider
```

Key choices:

- Next.js App Router runs on Vercel runtime, not static export.
- API keys live in Vercel environment variables.
- The knowledge base uses a small LLM Wiki instead of RAG because the public profile context is compact and auditable.
- MVP has no login, database, or persistent chat history.

For the broader domestic/overseas deployment decision, see [docs/chatbot-deployment-strategy.md](docs/chatbot-deployment-strategy.md).

## Environment

Create `.env.local` for local development:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5-mini
OPENAI_BASE_URL=
```

`OPENAI_BASE_URL` is optional. Leave it empty for the default OpenAI-compatible endpoint, or set it when using a compatible provider.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run knowledge:check
npm run build
```

## Knowledge System

Public facts are maintained in:

- `knowledge/raw/homepage.md`: raw migrated profile source.
- `knowledge/wiki/*.md`: reviewed runtime context injected into the system prompt.
- `knowledge/SCHEMA.md`: maintenance rules.

Contact policy for the chatbot:

- Allowed: `huali6641@gmail.com`, GitHub `takagibit18`, WeChat `Sean_Yu3`.
- Forbidden: phone number and private contact channels.

## Repository

<https://github.com/takagibit18/Talk-to-Sean>
