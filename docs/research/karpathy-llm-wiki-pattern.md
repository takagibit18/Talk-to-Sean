# Karpathy LLM Wiki Pattern Research

Research date: 2026-05-05

## Sources Checked

- Andrej Karpathy's original `llm-wiki.md` gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Cognition guide to `llm-wiki`: https://www.cognitionus.com/blog/llm-wiki-guide
- Karpathy Wiki guide: https://karpathy-wiki.lol/en
- Denser.ai analysis: https://denser.ai/blog/llm-wiki-karpathy-knowledge-base/

## Relevant Takeaways

The pattern is an alternative to classic RAG. Instead of retrieving raw chunks at query time and re-synthesizing an answer for every request, the LLM maintains a persistent markdown wiki that compiles knowledge ahead of time.

The architecture has three layers:

1. Raw sources: immutable curated documents and notes.
2. Wiki: LLM-maintained markdown pages with summaries, topic pages, entity pages, comparisons, and syntheses.
3. Schema: a convention document that defines structure, ingest workflow, query workflow, lint workflow, and citation rules.

The operations are:

- Ingest: read a new source and update multiple relevant wiki pages.
- Query: answer from wiki pages and optionally save useful answers back into the wiki.
- Lint: check contradictions, stale claims, orphan pages, missing cross-references, and missing source coverage.

For Talk to Sean, this means:

- No embedding-based RAG in the MVP.
- No runtime skills/tool modules for visitor answers.
- Use markdown files as the maintained knowledge layer.
- Load a deterministic, curated wiki context bundle into the chatbot system prompt.
- Treat missing wiki facts as unknown rather than inferring or inventing them.
