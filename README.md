# Talk to Sean

Public anonymous chatbot for visitors who arrive from Sean's personal homepage.

The first version is a standalone Vercel-deployed Next.js app. Sean's existing ICP-filed personal homepage should link out to this app instead of embedding it in the domestic site.

## Stack

- Next.js App Router
- Vercel AI SDK v6
- OpenAI provider via `@ai-sdk/openai`
- TypeScript
- Plain CSS for the initial app shell

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set these environment variables locally and in Vercel:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

Open `http://localhost:3000`.

## Repository

Expected remote:

```bash
https://github.com/takagibit18/Talk-to-Sean
```

## MVP Scope

- Public anonymous chat.
- No login.
- No persistent chat storage.
- No access code.
- No embedding in the ICP-filed domestic homepage.
- Personal homepage links to the Vercel app.
- Conservative answers when Sean-specific facts have not been added.
- Visible AI-generated-answer note in the chat UI.

## MVP Verification

After dependencies are available:

```bash
npm run typecheck
npm run build
```

With `OPENAI_API_KEY` configured, run the app locally and ask:

```text
What university did Sean attend?
```

Until that fact is explicitly added to `lib/sean-profile.ts`, the bot should say the current public profile does not include that detail.

## Profile Data

Sean-specific facts live in `lib/sean-profile.ts`. Keep the first version conservative: add only public facts that visitors are allowed to see. The system prompt is designed to avoid inventing personal details when the profile is incomplete.

## MVP+ Access Control Notes

Do not add access control in the MVP. For MVP+, prefer one of these incremental options:

- Simple shared access code checked in middleware.
- Signed link from the personal homepage.
- Vercel Edge Config or KV-backed allowlist if access rules need to change without redeploying.
