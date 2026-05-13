import { readFileSync } from "node:fs";

const context = readFileSync("content/wiki-context.md", "utf8").trim();

if (context.length < 80) {
  throw new Error("content/wiki-context.md must contain the public chat knowledge context.");
}

console.log("knowledge context ok");
