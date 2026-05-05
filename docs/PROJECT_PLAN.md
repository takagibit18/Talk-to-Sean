# Talk to Sean Project Plan

## Decision

Use option A as the deployment shape: a standalone Vercel chatbot app linked from the existing domestic personal homepage.

Reason: the current homepage is an ICP-filed personal website on Alibaba Cloud. Keeping the chatbot outside that deployed site reduces the chance that an interactive generative AI feature is treated as part of the ICP-filed personal homepage.

## MVP

Goal: ship a public anonymous chatbot that can answer visitors as Sean's public AI representative.

Build:

- Next.js App Router application.
- `/api/chat` route that streams model output.
- Vercel AI SDK chat UI.
- OpenAI model configured by environment variable.
- Local profile data file for Sean's public facts, response style, and boundaries.
- Conservative prompt rules that prevent invented personal claims.
- README and deployment documentation.

Out of scope:

- Login or access code.
- Conversation storage.
- Admin dashboard.
- Analytics.
- Retrieval over uploaded documents.
- Domestic-site embedding.

## MVP+ Candidate Work

- Add a simple access code or signed link.
- Add rate limiting and abuse controls.
- Add conversation analytics without storing sensitive chat content by default.
- Add structured profile sections for projects, timeline, skills, writing, and contact preferences.
- Add retrieval from a curated knowledge base if Sean's profile grows beyond static files.
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
