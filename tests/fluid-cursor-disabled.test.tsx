import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Hero from "@/components/cv/Hero";
import { CV_DATA } from "@/lib/cv-data";
import { SIGNAL_CYCLE_TIMINGS } from "@/lib/motion-system";

const testState = vi.hoisted(() => ({
  reducedMotion: false,
  fluidCursorRender: vi.fn(() => null),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => testState.reducedMotion,
  };
});

vi.mock("@/components/motion/FluidCursor", () => ({
  default: testState.fluidCursorRender,
}));

describe("Hero motion lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    testState.reducedMotion = false;
    testState.fluidCursorRender.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("does not mount the disabled Fluid Cursor runtime", () => {
    const { container } = render(<Hero data={CV_DATA.en} talkToSeanUrl="/chat" />);

    expect(testState.fluidCursorRender).not.toHaveBeenCalled();
    expect(container.querySelector(".fluid-cursor-canvas")).not.toBeInTheDocument();
  });

  it("moves one synchronized trace from idle through processing and verified to stable", () => {
    const { container } = render(<Hero data={CV_DATA.en} talkToSeanUrl="/chat" />);
    const trace = container.querySelector<HTMLElement>(".cv-hero-trace");

    expect(trace).toHaveAttribute("data-motion-state", "idle");
    expect(trace?.querySelector(".cv-system-state")).toHaveAttribute("data-state", "idle");
    expect(trace?.querySelector(".cv-hero-trace__result")).toHaveAttribute("data-state", "idle");

    act(() => vi.advanceTimersByTime(SIGNAL_CYCLE_TIMINGS.hero.startDelayMs));
    expect(trace).toHaveAttribute("data-motion-state", "processing");
    expect(trace?.querySelector(".cv-system-state")).toHaveTextContent(
      CV_DATA.en.hero.processingLabel,
    );
    expect(trace?.querySelector(".cv-hero-trace__result")).toHaveAttribute(
      "data-state",
      "processing",
    );

    act(() => vi.advanceTimersByTime(SIGNAL_CYCLE_TIMINGS.hero.processingMs));
    expect(trace).toHaveAttribute("data-motion-state", "verified");
    expect(trace?.querySelector(".cv-system-state")).toHaveTextContent(
      CV_DATA.en.hero.verifiedResultLabel,
    );
    expect(trace?.querySelector(".cv-hero-trace__result")).toHaveAttribute(
      "data-state",
      "verified",
    );

    act(() => vi.advanceTimersByTime(SIGNAL_CYCLE_TIMINGS.hero.verifiedMs));
    expect(trace).toHaveAttribute("data-motion-state", "stable");
    expect(trace?.querySelector(".cv-system-state")).toHaveAttribute("data-state", "stable");
    expect(trace?.querySelector(".cv-hero-trace__result")).toHaveAttribute(
      "data-state",
      "stable",
    );
  });

  it("renders the final stable trace immediately for reduced motion", () => {
    testState.reducedMotion = true;
    const { container } = render(<Hero data={CV_DATA.en} talkToSeanUrl="/chat" />);
    const trace = container.querySelector<HTMLElement>(".cv-hero-trace");

    expect(trace).toHaveAttribute("data-motion-state", "stable");
    expect(trace?.querySelector(".cv-system-state")).toHaveTextContent(
      CV_DATA.en.hero.verifiedResultLabel,
    );
    expect(trace?.querySelector(".cv-hero-trace__result")).toHaveAttribute(
      "data-state",
      "stable",
    );
  });
});
