# Deployment

## GitHub

Repository:

```text
https://github.com/takagibit18/Talk-to-Sean
```

Push the `codex/talk-to-sean-mvp` branch or merge it into the default branch before importing into Vercel.

## Vercel

1. Create a new Vercel project from the GitHub repository.
2. Framework preset: Next.js.
3. Build command: `next build`.
4. Install command: `npm install`.
5. Output directory: leave default.
6. Add environment variables:

```text
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

## Personal Homepage Link

On the Alibaba Cloud-hosted ICP-filed personal homepage, add a normal outbound link to the Vercel production URL.

Do not embed the chatbot with an iframe for the MVP.

Suggested button copy:

```text
Talk to Sean AI
```

## Launch Checklist

- `npm run typecheck` passes.
- `npm run build` passes.
- Vercel environment variables are configured.
- A production chat smoke test returns a response.
- `lib/sean-profile.ts` contains only Sean-approved public facts.
- The domestic personal homepage links out to the Vercel URL rather than embedding it.
