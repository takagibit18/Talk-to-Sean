# LLM Wiki Schema

This project follows the Karpathy LLM Wiki pattern. It does not use RAG, vector databases, or runtime skills for visitor answers.

## Layers

- `knowledge/raw/`: Sean-approved source notes. Treat these as source material, not runtime prompt text.
- `knowledge/wiki/`: maintained wiki pages used by the chatbot.
- `lib/wiki-context.ts`: deterministic context bundle loader for runtime grounding.

## Maintenance Rules

- Add new facts to `raw/` first when they come from Sean or a public source.
- Update one or more `wiki/` pages after raw sources change.
- Append maintenance notes to `knowledge/wiki/log.md`.
- Keep facts conservative and public.
- Do not store or expose Sean's phone number in runtime wiki pages.
- Contact policy: only expose `huali6641@gmail.com` in chatbot answers.
- If a claim lacks source support, either remove it or phrase it as a broad known direction.

## Answer Policy

- Answer from the compiled wiki context.
- Prefer concise Chinese when users ask in Chinese.
- Do not invent employers, internship records, production users, revenue, awards, GPA changes, or private contact details.
- If the wiki does not contain the exact fact, say so and answer with the closest known high-level context.
