import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IconCloud, { type IconCloudItem } from "@/components/motion/IconCloud";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => motionPreference.reduced,
  };
});

const ITEMS = [
  { label: "Python", glyph: "Py", color: "#3776ab", logoSrc: "/tech-logos/python.png" },
  { label: "Qdrant", glyph: "Qd", color: "#dc244c" },
] satisfies IconCloudItem[];

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

class ControlledIntersectionObserver implements IntersectionObserver {
  static instances: ControlledIntersectionObserver[] = [];
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0.05];
  readonly callback: ObserverCallback;
  target: Element | null = null;
  disconnected = false;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    ControlledIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.target = target;
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  emit(isIntersecting: boolean) {
    if (!this.target) throw new Error("IntersectionObserver has no target");
    this.callback(
      [
        {
          boundingClientRect: this.target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: this.target.getBoundingClientRect(),
          isIntersecting,
          rootBounds: null,
          target: this.target,
          time: performance.now(),
        },
      ],
      this,
    );
  }
}

function createCanvasContext() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
    globalAlpha: 1,
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: "",
    font: "",
    textAlign: "center",
    textBaseline: "middle",
  } as unknown as CanvasRenderingContext2D;
}

describe("IconCloud runtime lifecycle", () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;
  let getContext: ReturnType<typeof vi.fn>;
  let cancelAnimationFrame: ReturnType<typeof vi.fn>;

  const flushFrame = (time: number) => {
    const entry = rafCallbacks.entries().next().value as
      | [number, FrameRequestCallback]
      | undefined;
    if (!entry) throw new Error("No animation frame is scheduled");
    const [id, callback] = entry;
    rafCallbacks.delete(id);
    act(() => callback(time));
  };

  beforeEach(() => {
    motionPreference.reduced = false;
    ControlledIntersectionObserver.instances = [];
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: ControlledIntersectionObserver,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    rafCallbacks = new Map();
    nextRafId = 1;
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      const id = nextRafId++;
      rafCallbacks.set(id, callback);
      return id;
    }));
    cancelAnimationFrame = vi.fn((id: number) => {
      rafCallbacks.delete(id);
    });
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    getContext = vi.fn(() => createCanvasContext());
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      writable: true,
      value: getContext,
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 320,
      bottom: 320,
      width: 320,
      height: 320,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses one initialization and projects the visible DOM node and hit target together", () => {
    const { container, rerender } = render(
      <IconCloud items={ITEMS} activeLabels={[]} />,
    );
    const root = container.querySelector<HTMLElement>(".icon-cloud");
    const pythonBefore = screen.getByRole("button", { name: "Python" });
    const observer = ControlledIntersectionObserver.instances.at(-1);

    expect(root).toHaveAttribute("data-initialization-count", "1");
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(rafCallbacks).toHaveLength(0);

    act(() => observer?.emit(true));
    expect(rafCallbacks).toHaveLength(1);
    flushFrame(16.67);

    expect(pythonBefore.style.transform).toContain("translate3d(");
    expect(pythonBefore.querySelector(".icon-cloud__visual")).toBeInTheDocument();
    expect(pythonBefore.querySelector(".icon-cloud__label")).toHaveTextContent("Python");
    const tickBeforeHover = Number(root?.dataset.rotationTick);

    rerender(<IconCloud items={ITEMS} activeLabels={["Python"]} />);
    expect(screen.getByRole("button", { name: "Python" })).toBe(pythonBefore);
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-initialization-count", "1");

    flushFrame(33.34);
    expect(Number(root?.dataset.rotationTick)).toBeGreaterThan(tickBeforeHover);
  });

  it("pauses offscreen and hidden, resumes the previous tick, and stays static for reduced motion", () => {
    const { container, rerender, unmount } = render(
      <IconCloud items={ITEMS} activeLabels={[]} />,
    );
    const root = container.querySelector<HTMLElement>(".icon-cloud");
    const observer = ControlledIntersectionObserver.instances.at(-1);

    act(() => observer?.emit(true));
    flushFrame(16.67);
    flushFrame(33.34);
    const runningTick = Number(root?.dataset.rotationTick);

    act(() => observer?.emit(false));
    expect(root).toHaveAttribute("data-animation-state", "paused");
    expect(rafCallbacks).toHaveLength(0);

    act(() => observer?.emit(true));
    expect(rafCallbacks).toHaveLength(1);
    flushFrame(50.01);
    expect(Number(root?.dataset.rotationTick)).toBe(runningTick);
    flushFrame(66.68);
    expect(Number(root?.dataset.rotationTick)).toBeGreaterThan(runningTick);

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(root).toHaveAttribute("data-animation-state", "paused");
    expect(rafCallbacks).toHaveLength(0);

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(rafCallbacks).toHaveLength(1);

    motionPreference.reduced = true;
    rerender(<IconCloud items={ITEMS} activeLabels={[]} />);
    expect(root).toHaveAttribute("data-animation-state", "reduced");
    expect(root).toHaveAttribute("data-rotation-tick", "0.00");
    expect(rafCallbacks).toHaveLength(0);

    unmount();
    expect(observer?.disconnected).toBe(true);
    expect(rafCallbacks).toHaveLength(0);
  });

  it("provides equivalent preview, focus, and persistent click controls", () => {
    const onNodePreview = vi.fn();
    const onNodePreviewEnd = vi.fn();
    const onNodeToggle = vi.fn();
    render(
      <IconCloud
        items={ITEMS}
        activeLabels={["Python"]}
        selectedLabels={["Python"]}
        onNodePreview={onNodePreview}
        onNodePreviewEnd={onNodePreviewEnd}
        onNodeToggle={onNodeToggle}
      />,
    );
    const python = screen.getByRole("button", { name: "Python" });

    expect(python).toHaveAttribute("aria-pressed", "true");
    fireEvent.pointerEnter(python);
    expect(onNodePreview).toHaveBeenLastCalledWith("Python");
    fireEvent.focus(python);
    expect(onNodePreview).toHaveBeenLastCalledWith("Python");
    fireEvent.pointerLeave(python);
    fireEvent.blur(python);
    expect(onNodePreviewEnd).toHaveBeenCalledTimes(2);
    fireEvent.click(python);
    expect(onNodeToggle).toHaveBeenCalledWith("Python");
  });
});
