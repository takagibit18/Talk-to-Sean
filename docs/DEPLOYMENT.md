# Vercel Deployment Checklist

Talk-to-Sean v2 runs as a Next.js app with server-side API routes. Do not deploy it as `output: "export"` when `/api/chat` is enabled.

## Environment Variables

| Name | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side model provider key. Must start with `sk-`. |
| `GITHUB_USERNAME` | Yes | GitHub profile source for homepage user, repositories, and activity. |
| `OPENAI_MODEL` | No | Chat model name. Defaults to `gpt-5-mini`. |
| `OPENAI_BASE_URL` | No | OpenAI-compatible base URL. Defaults to `https://api.openai.com/v1`. |
| `GITHUB_PAT` | No | Raises GitHub API limits and reduces unauthenticated API failures. |
| `UPSTASH_REDIS_REST_URL` or `KV_REST_API_URL` | Production chat: Yes | Persistent Redis REST URL for public quota enforcement. Vercel KV integrations usually inject `KV_REST_API_URL`. |
| `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_TOKEN` | Production chat: Yes | Persistent Redis REST token for public quota enforcement. Vercel KV integrations usually inject `KV_REST_API_TOKEN`. |
| `DAILY_REQUEST_LIMIT` | No | Owner-side public daily request cap. Defaults to `50`. |
| `DAILY_IP_LIMIT` | No | Per-IP daily cap. Defaults to `8`. |
| `DAILY_SESSION_LIMIT` | No | Anonymous browser-session daily cap. Defaults to `8`. |
| `CHAT_ALLOWED_ORIGINS` | No | Comma-separated extra browser origins allowed to POST to `/api/chat`. The deployed request origin is always allowed. |

## Preview Protection

Use an isolated low-cost preview API key and model for Vercel Preview environments. Preview deploys are easy to share and can consume production quota if they reuse the same key. Keep production keys only in the Production environment, set lower `DAILY_REQUEST_LIMIT` and `DAILY_IP_LIMIT` for Preview, and consider a cheaper OpenAI-compatible provider there.

## Public Chat Protection

Production `/api/chat` is intentionally fail-closed unless Upstash Redis is configured. In-memory counters are acceptable for local development and tests, but they are not reliable protection on Vercel because serverless instances can cold-start or scale horizontally. Configure an Upstash Redis or Vercel KV integration before enabling `OPENAI_API_KEY` for production chat.

The chat endpoint enforces three quota layers:

- short-window in-memory burst limit per IP hash;
- persistent daily total and per-IP limits in Redis;
- persistent anonymous session limits via an HttpOnly `tts_session` cookie.

Browser POST requests with a foreign `Origin` are rejected. Set `CHAT_ALLOWED_ORIGINS` only when another trusted frontend domain needs to call this deployment directly.

## Allowed Dev Origins

`ALLOWED_DEV_ORIGINS` is for local development only, especially when testing from another LAN device. Example:

```env
ALLOWED_DEV_ORIGINS=10.80.12.101,localhost:3001
```

Do not set LAN-only origins for production. Vercel production requests should arrive through the deployed domain.

## Deployment Verification

1. Open `/api/health` and confirm HTTP 200 with `{ "status": "ok" }`.
2. Open `/` and confirm Hero, About, Skills, Projects, Activity, Education, Languages, Publications, Contact, and Footer render.
3. Open `/chat`, send a short prompt, and confirm the first response starts within 5 seconds.
4. Open `/sitemap.xml` and `/robots.txt` and confirm both return HTTP 200.
5. In development only, open `/api/dev/config-check` and confirm the key is masked as `configured`.

## Provider Notes

The app uses OpenAI-compatible `/chat/completions` and `/models` endpoints. OpenAI, DeepSeek, OpenRouter, and a self-hosted compatible gateway can all work when `OPENAI_BASE_URL`, `OPENAI_MODEL`, and `OPENAI_API_KEY` are aligned.
