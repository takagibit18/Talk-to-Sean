# Projects

Sources: knowledge/raw/homepage.md

## shotgunCV

shotgunCV is a pipeline-first AI Resume Ops project for high-volume applications.

Known public scope:

- Batch JD parsing.
- Resume variant generation.
- Resume scoring and ranking.
- Application strategy output.
- Goal: help users make better bulk job-search decisions.

Case-study framing:

- Problem: bulk applications create noisy job requirements, resume variants, and weak decision quality.
- Architecture: turn the workflow into pipeline stages for ingestion, extraction, variant generation, scoring, ranking, and strategy output.
- Engineering focus: structured outputs, batch processing, scoring, traceable decisions, and practical UX around job-search decisions.

Conservative answer direction:

- Describe it as a pipeline and product workflow project.
- Emphasize structured outputs, batch processing, scoring, and traceable decisions.
- Do not claim production users, revenue, hiring outcomes, or enterprise deployment unless Sean adds those facts.

## Mergewarden

Mergewarden is an LLM-powered code review and debugging assistant for teams and local pipelines.

Known public scope:

- Turns diffs and failure signals into graded review findings.
- Produces verifiable debugging steps.
- Targets team workflows and local pipelines.
- Includes containerized deployment and CI integration.

Case-study framing:

- Problem: developers need higher-signal review findings and debugging steps from noisy diffs and CI failures.
- Architecture: collect diff context and failure signals, generate severity-graded findings, and return verification-oriented next steps.
- Engineering focus: diff understanding, failure triage, severity grading, reproducible debugging, Docker, and CI integration.

Conservative answer direction:

- Describe it as a code-review and debugging workflow assistant.
- Emphasize diff understanding, CI failure signals, severity grading, and verification steps.
- Do not claim integration with a specific company, team, or production deployment unless Sean adds those facts.

## Talk to Sean

Talk to Sean is the overseas personal homepage and embedded chatbot experience.

Known public scope:

- Next.js runtime app for Vercel.
- Embedded chatbot on `/` and full-screen chat on `/chat`.
- Server-side `/api/chat` route calls the model provider.
- API key stays in server-side environment variables.
- Curated LLM Wiki provides the factual context.
- MVP does not add login, a database, or persistent chat history.

Conservative answer direction:

- Explain that this project is an owner-provided API chatbot, not a BYOK-first demo.
- Emphasize server-side model calls, streaming UX, public-profile boundaries, rate limiting, and conservative answers from the wiki.
