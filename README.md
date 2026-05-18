# Talk-to-Sean

Next.js 15 personal homepage with a server-side AI profile assistant. The app shows Sean's GitHub profile, repositories, contribution activity, and a `/chat` surface backed by an OpenAI-compatible model provider.

## Product Surface

- `/` renders the homepage: hero, profile, repositories, activity, skills, projects, education, publications, and contact sections.
- `/chat` renders the Talk to Sean AI profile assistant.
- `/api/chat` streams assistant responses from a server-side OpenAI-compatible provider.
- `/api/health` supports deployment smoke checks.
- `/api/dev/config-check` exposes masked configuration checks in development only.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Local URL: `http://localhost:3000`

## Environment

Required:

```env
OPENAI_API_KEY=sk-your-provider-key
GITHUB_USERNAME=your-github-username
```

Optional provider settings:

```env
OPENAI_MODEL=gpt-5-mini
OPENAI_BASE_URL=https://api.openai.com/v1
GITHUB_PAT=
```

Production chat protection requires persistent Redis-compatible storage. Use either Upstash Redis REST variables or Vercel KV REST variables:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Local development can use in-memory counters. Production `/api/chat` intentionally fails closed when persistent storage is missing.

## Cost Controls

```env
DAILY_REQUEST_LIMIT=50
DAILY_IP_LIMIT=8
DAILY_SESSION_LIMIT=8
CHAT_ALLOWED_ORIGINS=
ALLOWED_DEV_ORIGINS=localhost:3000
```

`CHAT_ALLOWED_ORIGINS` is for production chat origin allowlisting. `ALLOWED_DEV_ORIGINS` is only for local device testing with Next dev.

## Commands

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm run test
npm run knowledge:check
```

## Deployment

Deploy as a full Next.js app with server-side routes. Static-only hosting will not run `/api/chat`.

Recommended Vercel setup:

1. Connect the repository to Vercel.
2. Set `OPENAI_API_KEY` and `GITHUB_USERNAME`.
3. Add `GITHUB_PAT` if GitHub API rate limits are an issue.
4. Configure Upstash Redis or Vercel KV before enabling production chat.
5. Keep preview deployments on isolated low-cost model keys and lower daily limits.

Detailed deployment notes: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

Domestic static entry plus overseas chatbot service notes: [DEPLOY_ALIYUN.md](DEPLOY_ALIYUN.md)

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Upstash Redis or Vercel KV for persistent public chat quotas

## Repository Layout

```text
app/                 Next.js routes, API routes, layouts, metadata
components/          Homepage, motion, and chat UI components
content/             Public assistant context corpus
docs/                Deployment and architecture notes
lib/                 Config, provider, GitHub, cost guard, and usage logic
scripts/             Knowledge-context validation
tests/               Vitest route, config, prompt, and guard coverage
```
