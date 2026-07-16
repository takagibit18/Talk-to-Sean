import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Skills from "@/components/cv/Skills";
import {
  getCapabilitiesForTechnology,
  getCloudTechnologiesForCapability,
} from "@/components/cv/CapabilityMatrix";
import { CV_DATA } from "@/lib/cv-data";
import { SIGNAL_CYCLE_TIMINGS } from "@/lib/motion-system";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => false };
});

describe("Capability and Icon Cloud linking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("preserves bidirectional technology mappings and ignores unrelated labels", () => {
    expect(getCapabilitiesForTechnology("Python")).toEqual([
      "agent-runtime",
      "evaluation",
      "backend",
    ]);
    expect(getCapabilitiesForTechnology("Unknown")).toEqual([]);
    expect(getCloudTechnologiesForCapability("retrieval")).toEqual(["Qdrant"]);
    expect(getCloudTechnologiesForCapability("missing")).toEqual([]);
    expect(getCloudTechnologiesForCapability("infrastructure")).toEqual([
      "Next.js",
      "Docker",
      "Redis",
    ]);
  });

  it("uses processing only for a transient preview and returns smoothly to stable", () => {
    const { container } = render(<Skills data={CV_DATA.en} />);
    const cloud = screen.getByRole("group", { name: /core technology ecosystem/i });
    const matrix = screen.getByRole("list", { name: /engineering capability matrix/i });
    const cloudState = container.querySelector(
      ".cv-skills-system__heading .signal-state-label",
    );
    const matrixState = container.querySelector(
      ".capability-matrix__heading .signal-state-label",
    );
    const fastApi = within(cloud).getByRole("button", { name: "FastAPI" });
    const backend = within(matrix).getByRole("button", { name: /^backend:/i });

    expect(cloudState).toHaveAttribute("data-state", "stable");
    expect(matrixState).toHaveAttribute("data-state", "stable");

    fireEvent.pointerEnter(fastApi);
    expect(cloudState).toHaveAttribute("data-state", "processing");
    expect(matrixState).toHaveAttribute("data-state", "processing");
    expect(backend).toHaveAttribute("data-active", "true");

    fireEvent.pointerLeave(fastApi);
    act(() => vi.advanceTimersByTime(SIGNAL_CYCLE_TIMINGS.capability.exitDelayMs - 1));
    expect(cloudState).toHaveAttribute("data-state", "processing");
    expect(backend).toHaveAttribute("data-active", "true");

    act(() => vi.advanceTimersByTime(1));
    expect(cloudState).toHaveAttribute("data-state", "stable");
    expect(matrixState).toHaveAttribute("data-state", "stable");
    expect(backend).toHaveAttribute("data-active", "false");
  });

  it("switches rapid row previews without an intermediate global clear", () => {
    const { container } = render(<Skills data={CV_DATA.en} />);
    const matrix = screen.getByRole("list", { name: /engineering capability matrix/i });
    const rows = within(matrix).getAllByRole("button");
    const cloud = screen.getByRole("group", { name: /core technology ecosystem/i });

    rows.forEach((row) => fireEvent.pointerEnter(row));

    expect(container.querySelector(".capability-matrix__heading .signal-state-label")).toHaveAttribute(
      "data-state",
      "processing",
    );
    expect(within(cloud).getByRole("button", { name: "Qdrant" })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(within(cloud).getByRole("button", { name: "Python" })).toHaveAttribute(
      "data-active",
      "false",
    );
  });

  it("keeps click and touch selections, switches them, and toggles them off", () => {
    render(<Skills data={CV_DATA.en} />);
    const cloud = screen.getByRole("group", { name: /core technology ecosystem/i });
    const matrix = screen.getByRole("list", { name: /engineering capability matrix/i });
    const qdrant = within(cloud).getByRole("button", { name: "Qdrant" });
    const retrieval = within(matrix).getByRole("button", { name: /^retrieval:/i });
    const fastApi = within(cloud).getByRole("button", { name: "FastAPI" });

    fireEvent.click(qdrant);
    expect(qdrant).toHaveAttribute("aria-pressed", "true");
    expect(retrieval).toHaveAttribute("data-active", "true");
    expect(retrieval).toHaveAttribute("data-selected", "true");

    fireEvent.click(fastApi);
    expect(qdrant).toHaveAttribute("aria-pressed", "false");
    expect(fastApi).toHaveAttribute("aria-pressed", "true");
    expect(retrieval).toHaveAttribute("data-selected", "false");

    fireEvent.click(fastApi);
    expect(fastApi).toHaveAttribute("aria-pressed", "false");
    expect(within(matrix).getAllByRole("button").every((row) => row.dataset.active === "false")).toBe(true);

    fireEvent.click(retrieval);
    expect(retrieval).toHaveAttribute("aria-pressed", "true");
    expect(qdrant).toHaveAttribute("aria-pressed", "true");
  });

  it("gives keyboard focus the same preview and delayed blur behavior", () => {
    render(<Skills data={CV_DATA.en} />);
    const cloud = screen.getByRole("group", { name: /core technology ecosystem/i });
    const matrix = screen.getByRole("list", { name: /engineering capability matrix/i });
    const python = within(cloud).getByRole("button", { name: "Python" });
    const evaluation = within(matrix).getByRole("button", { name: /^evaluation:/i });

    fireEvent.focus(python);
    expect(evaluation).toHaveAttribute("data-active", "true");
    fireEvent.blur(python);
    act(() => vi.advanceTimersByTime(SIGNAL_CYCLE_TIMINGS.capability.exitDelayMs));
    expect(evaluation).toHaveAttribute("data-active", "false");
  });
});
