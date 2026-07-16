import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MergeWardenFlow from "@/components/motion/MergeWardenFlow";

const animationFrameRegistration = vi.hoisted(() => vi.fn());

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useAnimationFrame: animationFrameRegistration,
    useReducedMotion: () => false,
  };
});

describe("homepage ambient motion budget", () => {
  it("does not register a continuous MergeWarden animation frame", () => {
    render(<MergeWardenFlow locale="en" />);
    expect(animationFrameRegistration).not.toHaveBeenCalled();
  });

  it("contains no infinite MergeWarden transition loops", () => {
    const source = readFileSync(
      join(process.cwd(), "components/motion/MergeWardenFlow.tsx"),
      "utf8",
    );

    expect(source).not.toMatch(/repeat\s*:\s*[^,\n]*Infinity/);
    expect(source).not.toContain("useAnimationFrame");
  });

  it("keeps the homepage availability indicator finite", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    const statusDotRule = css.match(/\.cv-status-dot\s*\{[^}]+\}/)?.[0];

    expect(statusDotRule).toBeDefined();
    expect(statusDotRule).not.toContain("infinite");
  });
});
