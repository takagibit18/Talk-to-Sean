# Close MVP Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first production-readiness layer for the public chatbot without changing the MVP architecture.

**Architecture:** Keep the app file-based and anonymous. Add a small in-memory rate limiter around `/api/chat`, a local Wiki validation script for maintainers, and tighter tests for conservative answer policy.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Node.js scripts.

---

## File Map

- `lib/rate-limit.ts`: in-memory fixed-window limiter with a testable clock.
- `app/api/chat/route.ts`: applies the limiter before model invocation.
- `tests/rate-limit.test.ts`: unit tests for limiter behavior.
- `scripts/validate-knowledge.mjs`: validates required Wiki files, raw sources, public contact policy, and source references.
- `tests/knowledge-validation.test.ts`: exercises the validator as a CLI.
- `lib/prompt.ts`: aligns contact policy with the schema.
- `tests/prompt.test.ts`: verifies the prompt does not permit private or unapproved contact details.
- `package.json`: adds `knowledge:check`.

## Tasks

- [ ] Add failing rate-limit tests.
- [ ] Implement minimal rate-limit module.
- [ ] Wire limiter into `/api/chat`.
- [ ] Add failing knowledge validator CLI tests.
- [ ] Implement validator and `knowledge:check` script.
- [ ] Tighten prompt tests for approved contact policy.
- [ ] Update prompt to match schema.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run knowledge:check`.
