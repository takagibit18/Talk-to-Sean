import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const validatorPath = join(process.cwd(), "scripts", "validate-knowledge.mjs");

describe("knowledge validator", () => {
  it("passes for the repository knowledge base", () => {
    const output = execFileSync("node", [validatorPath], {
      cwd: process.cwd(),
      encoding: "utf8"
    });

    expect(output).toContain("Knowledge validation passed");
  });

  it("fails when a required wiki page is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "talk-to-sean-knowledge-"));
    mkdirSync(join(root, "knowledge", "raw"), { recursive: true });
    mkdirSync(join(root, "knowledge", "wiki"), { recursive: true });
    writeFileSync(join(root, "knowledge", "raw", "homepage.md"), "# Homepage\n");
    writeFileSync(join(root, "knowledge", "wiki", "index.md"), "# Index\nSource: knowledge/raw/homepage.md\n");

    expect(() =>
      execFileSync("node", [validatorPath, "--root", root], {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe"
      })
    ).toThrow(/Missing required wiki page/);
  });
});
