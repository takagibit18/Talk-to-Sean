# Talk to Sean Design

## Objective

Create a standalone Vercel-hosted chatbot that visitors can open from Sean's existing personal homepage. The MVP is public and anonymous.

## Architecture

The app uses Next.js App Router. The browser renders a chat interface at `/`. User messages are sent to `/api/chat`, where a server route calls the OpenAI model through the Vercel AI SDK and streams UI message chunks back to the client.

Sean-specific behavior is controlled by a Karpathy LLM Wiki pattern, not RAG and not runtime skills. Sean-approved raw sources are kept immutable under `knowledge/raw/`. Maintained markdown pages under `knowledge/wiki/` compile those sources into stable public facts, projects, voice notes, and boundaries. The app loads a deterministic wiki context bundle into the system prompt.

The model must answer from the compiled wiki and respond conservatively when wiki facts are missing.

## Components

- `app/page.tsx`: renders the primary chatbot screen.
- `components/chat-shell.tsx`: client-side chat UI, message display, starter prompts, composer, stop control.
- `app/api/chat/route.ts`: validates incoming messages and streams model output.
- `lib/sean-profile.ts`: public facts and response constraints.
- `lib/prompt.ts`: system prompt assembly.
- `lib/chat-policy.ts`: request-size and shape validation.
- `knowledge/SCHEMA.md`: wiki maintenance conventions.
- `knowledge/raw/`: immutable Sean-approved source material.
- `knowledge/wiki/`: compiled markdown wiki used as chatbot context.

## Data Flow

1. Visitor opens the Vercel app from Sean's personal homepage.
2. Visitor sends a message in the browser.
3. `useChat` posts UI messages to `/api/chat`.
4. The route validates message count, role shape, and total text length.
5. The route calls the configured OpenAI model with Sean's system prompt, compiled wiki context, and conversation messages.
6. The response streams back to the UI.

## Error Handling

Invalid request payloads return HTTP 400. Provider or API-key failures are converted to a user-facing unavailable message. The client shows a short error note when the chat hook reports failure.

## Version Scope

MVP includes anonymous public chat and file-based LLM Wiki context only. Access codes, login, rate limiting, persistence, analytics, embedding-based RAG, vector databases, and runtime skills are out of scope.

## Deployment

The app deploys independently on Vercel. The Alibaba Cloud ICP-filed personal homepage links to the Vercel production URL. The chatbot is not embedded into the domestic homepage in the MVP.

## Testing

Initial checks:

- TypeScript typecheck.
- Next.js production build.
- Manual chat UI smoke test with environment variables configured.
- Prompt behavior test by asking for facts absent from `knowledge/wiki/`.
