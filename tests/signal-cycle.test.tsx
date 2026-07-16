import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSignalCycle } from "@/components/motion/useSignalCycle";

const DURATIONS = {
  processingMs: 1_000,
  verifiedMs: 400,
} as const;

describe("useSignalCycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  it("runs idle to processing to verified to stable with one timer at a time", () => {
    const { result } = renderHook(() =>
      useSignalCycle({ reducedMotion: false, ...DURATIONS }),
    );

    expect(result.current.state).toBe("idle");

    act(() => {
      expect(result.current.replay()).toBe(true);
    });
    expect(result.current.state).toBe("processing");
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(DURATIONS.processingMs));
    expect(result.current.state).toBe("verified");
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(DURATIONS.verifiedMs));
    expect(result.current.state).toBe("stable");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("replays from stable and ignores repeated triggers during an active cycle", () => {
    const { result } = renderHook(() =>
      useSignalCycle({ reducedMotion: false, ...DURATIONS }),
    );

    act(() => {
      expect(result.current.replay()).toBe(true);
      expect(result.current.replay()).toBe(false);
      expect(result.current.replay()).toBe(false);
    });
    expect(result.current.state).toBe("processing");
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(DURATIONS.processingMs + DURATIONS.verifiedMs));
    expect(result.current.state).toBe("stable");

    act(() => {
      expect(result.current.replay()).toBe(true);
    });
    expect(result.current.state).toBe("processing");
    expect(vi.getTimerCount()).toBe(1);
  });

  it("supports a delayed auto start without creating duplicate timers", () => {
    const { result } = renderHook(() =>
      useSignalCycle({
        reducedMotion: false,
        autoStart: true,
        startDelayMs: 250,
        ...DURATIONS,
      }),
    );

    expect(result.current.state).toBe("idle");
    expect(vi.getTimerCount()).toBe(1);
    act(() => {
      expect(result.current.replay(250)).toBe(false);
    });
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(250));
    expect(result.current.state).toBe("processing");
    expect(vi.getTimerCount()).toBe(1);
  });

  it("uses the same timer controller for a delayed stable exit", () => {
    const { result } = renderHook(() =>
      useSignalCycle({ reducedMotion: false, ...DURATIONS }),
    );

    act(() => result.current.begin());
    expect(result.current.state).toBe("processing");
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      result.current.settleAfter(260);
      result.current.settleAfter(260);
    });
    expect(result.current.state).toBe("processing");
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(260));
    expect(result.current.state).toBe("stable");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans timers on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useSignalCycle({ reducedMotion: false, ...DURATIONS }),
    );

    act(() => result.current.replay());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("settles and clears work when the document becomes hidden", () => {
    const { result } = renderHook(() =>
      useSignalCycle({ reducedMotion: false, ...DURATIONS }),
    );

    act(() => result.current.replay());
    expect(result.current.state).toBe("processing");

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.state).toBe("stable");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses a static stable state and starts no timers for reduced motion", () => {
    const { result } = renderHook(() =>
      useSignalCycle({
        reducedMotion: true,
        autoStart: true,
        startDelayMs: 250,
        ...DURATIONS,
      }),
    );

    expect(result.current.state).toBe("stable");
    act(() => {
      expect(result.current.replay()).toBe(false);
      result.current.begin();
      result.current.verify();
      result.current.settleAfter(260);
    });
    expect(result.current.state).toBe("stable");
    expect(vi.getTimerCount()).toBe(0);
  });
});
