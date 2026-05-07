import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const requiredWikiPages = [
  "index.md",
  "sean.md",
  "projects.md",
  "capabilities.md",
  "interview-qa.md",
  "voice.md",
  "boundaries.md",
  "log.md"
];

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const root = resolve(rootIndex >= 0 ? args[rootIndex + 1] : process.cwd());
const knowledgeDir = join(root, "knowledge");
const rawDir = join(knowledgeDir, "raw");
const wikiDir = join(knowledgeDir, "wiki");
const errors = [];

if (!existsSync(rawDir)) {
  errors.push("Missing knowledge/raw directory.");
}

if (!existsSync(wikiDir)) {
  errors.push("Missing knowledge/wiki directory.");
}

const rawFiles = existsSync(rawDir)
  ? readdirSync(rawDir).filter((file) => file.endsWith(".md"))
  : [];

if (rawFiles.length === 0) {
  errors.push("Missing raw source markdown files.");
}

for (const page of requiredWikiPages) {
  const pagePath = join(wikiDir, page);

  if (!existsSync(pagePath)) {
    errors.push(`Missing required wiki page: knowledge/wiki/${page}`);
    continue;
  }

  const content = readFileSync(pagePath, "utf8").trim();

  if (!content) {
    errors.push(`Empty wiki page: knowledge/wiki/${page}`);
    continue;
  }

  if (page !== "log.md" && !/\bSources?:\s+/i.test(content)) {
    errors.push(`Missing source reference in knowledge/wiki/${page}`);
  }

  if (/\b1[3-9]\d{9}\b/.test(content)) {
    errors.push(`Possible phone number in knowledge/wiki/${page}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }

  process.exit(1);
}

console.log("Knowledge validation passed");
