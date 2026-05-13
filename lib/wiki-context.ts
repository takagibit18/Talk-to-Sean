import { readFileSync } from "fs";
import { join } from "path";

const WIKI_TTL_MS = 5 * 60 * 1000;
let cachedContext: { value: string; expiresAt: number } | null = null;

export function getWikiContext() {
  const now = Date.now();

  if (cachedContext && cachedContext.expiresAt > now) {
    return cachedContext.value;
  }

  const filePath = join(process.cwd(), "content", "wiki-context.md");
  const value = readFileSync(filePath, "utf8").trim();
  cachedContext = {
    value,
    expiresAt: now + WIKI_TTL_MS,
  };

  return value;
}

export function resetWikiContextCacheForTests() {
  cachedContext = null;
}
