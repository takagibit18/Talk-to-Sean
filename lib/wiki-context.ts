import { readFileSync } from "node:fs";
import { join } from "node:path";

export const WIKI_CONTEXT_FILES = [
  "knowledge/wiki/index.md",
  "knowledge/wiki/sean.md",
  "knowledge/wiki/projects.md",
  "knowledge/wiki/capabilities.md",
  "knowledge/wiki/interview-qa.md",
  "knowledge/wiki/voice.md",
  "knowledge/wiki/boundaries.md"
] as const;

export function getWikiContext() {
  return WIKI_CONTEXT_FILES.map((filePath) => {
    const fileName = filePath.replace("knowledge/wiki/", "");
    const fullPath = join(process.cwd(), "knowledge", "wiki", fileName);
    const content = readFileSync(fullPath, "utf8").trim();

    return `<!-- ${filePath} -->\n${content}`;
  }).join("\n\n---\n\n");
}
