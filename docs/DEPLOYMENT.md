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
| `DAILY_REQUEST_LIMIT` | No | Owner-side public daily request cap. Defaults to `100`. |
| `DAILY_IP_LIMIT` | No | Per-IP daily cap. Defaults to `20`. |

## Preview Protection

Use an isolated low-cost preview API key and model for Vercel Preview environments. Preview deploys are easy to share and can consume production quota if they reuse the same key. Keep production keys only in the Production environment, set lower `DAILY_REQUEST_LIMIT` and `DAILY_IP_LIMIT` for Preview, and consider a cheaper OpenAI-compatible provider there.

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
