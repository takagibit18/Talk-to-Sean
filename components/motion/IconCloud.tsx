"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export type IconCloudItem = {
  label: string;
  glyph: string;
  color: string;
  logoSrc?: string;
};

type IconCloudProps = {
  items: IconCloudItem[];
  label?: string;
  groupLabel?: string;
  activeLabels?: string[];
  selectedLabels?: string[];
  onNodePreview?: (label: string) => void;
  onNodePreviewEnd?: () => void;
  onNodeToggle?: (label: string) => void;
  /** Compatibility for callers while the linked interaction state migrates. */
  onNodeActivate?: (label: string) => void;
};

export type IconCloudSpherePoint = {
  x: number;
  y: number;
  z: number;
};

export type IconCloudRotation = {
  rotationX: number;
  rotationY: number;
};

const DEFAULT_LABEL = "Interactive technology icon cloud";
const EMPTY_LABELS: string[] = [];

export const ICON_CLOUD_ROTATION_CONFIG = {
  autoRotateY: 0.0059,
  autoRotateX: 0.0024,
  pointerRotateY: 1.7,
  pointerRotateX: 1.3,
  tickIncrement: 1,
  pointerActiveTickIncrement: 1,
  pointerLeaveDecayMs: 1500,
} as const;

export const ICON_CLOUD_ORBIT_CONFIG = {
  lineWidth: 1,
  backAlpha: 0.08,
  frontAlpha: 0.2,
} as const;

export const ICON_CLOUD_VISIBLE_ORBIT_COUNT = 3;

export function getIconCloudPointerDecay(
  elapsedMs: number,
  durationMs = ICON_CLOUD_ROTATION_CONFIG.pointerLeaveDecayMs,
) {
  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  return Math.pow(1 - progress, 3);
}

export function createIconCloudOrbitPoints(
  anchorPoint: IconCloudSpherePoint,
  segments = 96,
  planeAngle = 0,
) {
  const anchorLength = Math.hypot(anchorPoint.x, anchorPoint.y, anchorPoint.z) || 1;
  const anchor = {
    x: anchorPoint.x / anchorLength,
    y: anchorPoint.y / anchorLength,
    z: anchorPoint.z / anchorLength,
  };
  const reference =
    Math.abs(anchor.y) < 0.92
      ? { x: 0, y: 1, z: 0 }
      : { x: 1, y: 0, z: 0 };
  const tangentA = normalizePoint(crossPoint(reference, anchor));
  const tangentB = normalizePoint(crossPoint(anchor, tangentA));
  const orbitTangent = {
    x: tangentA.x * Math.cos(planeAngle) + tangentB.x * Math.sin(planeAngle),
    y: tangentA.y * Math.cos(planeAngle) + tangentB.y * Math.sin(planeAngle),
    z: tangentA.z * Math.cos(planeAngle) + tangentB.z * Math.sin(planeAngle),
  };

  return Array.from({ length: segments + 1 }, (_, index): IconCloudSpherePoint => {
    const theta = (Math.PI * 2 * index) / segments;
    return {
      x: anchor.x * Math.cos(theta) + orbitTangent.x * Math.sin(theta),
      y: anchor.y * Math.cos(theta) + orbitTangent.y * Math.sin(theta),
      z: anchor.z * Math.cos(theta) + orbitTangent.z * Math.sin(theta),
    };
  });
}

export function projectIconCloudPoint(
  point: IconCloudSpherePoint,
  rotation: IconCloudRotation,
  width: number,
  height: number,
) {
  const cosY = Math.cos(rotation.rotationY);
  const sinY = Math.sin(rotation.rotationY);
  const cosX = Math.cos(rotation.rotationX);
  const sinX = Math.sin(rotation.rotationX);
  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;
  const y1 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;
  const perspective = 2.45;
  const scale = perspective / (perspective - z2);
  const radius = Math.min(width, height) * 0.33;

  return {
    x: width / 2 + x1 * radius * scale,
    y: height / 2 + y1 * radius * scale,
    z: z2,
    scale,
  };
}

function crossPoint(a: IconCloudSpherePoint, b: IconCloudSpherePoint): IconCloudSpherePoint {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalizePoint(point: IconCloudSpherePoint): IconCloudSpherePoint {
  const length = Math.hypot(point.x, point.y, point.z) || 1;
  return {
    x: point.x / length,
    y: point.y / length,
    z: point.z / length,
  };
}

function clampPointer(value: number) {
  return Math.min(0.5, Math.max(-0.5, value));
}

function createSpherePoints(count: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index): IconCloudSpherePoint => {
    const y = 1 - (index / Math.max(count - 1, 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    return {
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    };
  });
}

function cssVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function IconCloud({
  items,
  label = DEFAULT_LABEL,
  groupLabel = "Core technology ecosystem",
  activeLabels = EMPTY_LABELS,
  selectedLabels = EMPTY_LABELS,
  onNodePreview,
  onNodePreviewEnd,
  onNodeToggle,
  onNodeActivate,
}: IconCloudProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();
  const reducedMotionRef = useRef(reducedMotion === true);
  const activeLabelsRef = useRef(activeLabels);
  const itemsRef = useRef(items);
  const tickRef = useRef(0);
  const initializationCountRef = useRef(0);
  const drawRef = useRef<(() => void) | null>(null);
  const syncAnimationRef = useRef<(() => void) | null>(null);
  const points = useMemo(() => createSpherePoints(items.length), [items.length]);

  itemsRef.current = items;
  activeLabelsRef.current = activeLabels;
  reducedMotionRef.current = reducedMotion === true;

  useEffect(() => {
    const root = rootRef.current;
    if (root) root.dataset.activeLabel = activeLabels.join(",");
    drawRef.current?.();
  }, [activeLabels]);

  useEffect(() => {
    if (reducedMotion === true) {
      tickRef.current = 0;
    }
    syncAnimationRef.current?.();
  }, [reducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || points.length === 0) return undefined;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return undefined;
    }
    if (!ctx) return undefined;

    initializationCountRef.current += 1;
    root.dataset.initializationCount = String(initializationCountRef.current);

    let mounted = true;
    let isIntersecting = false;
    let pageVisible = document.visibilityState === "visible";
    let animationFrame: number | null = null;
    let lastFrameTime: number | null = null;
    let width = 320;
    let height = 320;
    let dpr = 1;
    const pointer = {
      x: 0,
      y: 0,
      active: false,
      leaveStart: 0,
      leaveFromX: 0,
      leaveFromY: 0,
    };

    const setAnimationState = (state: "running" | "paused" | "reduced") => {
      root.dataset.animationState = state;
    };

    const getPointerInfluence = (now: number) => {
      if (reducedMotionRef.current) return { x: 0, y: 0 };
      if (pointer.active) return { x: pointer.x, y: pointer.y };
      if (pointer.leaveStart === 0) return { x: 0, y: 0 };

      const decay = getIconCloudPointerDecay(now - pointer.leaveStart);
      if (decay <= 0) {
        pointer.leaveStart = 0;
        pointer.x = 0;
        pointer.y = 0;
        return { x: 0, y: 0 };
      }
      return {
        x: pointer.leaveFromX * decay,
        y: pointer.leaveFromY * decay,
      };
    };

    const getRotation = (now: number): IconCloudRotation => {
      const influence = getPointerInfluence(now);
      return {
        rotationY:
          tickRef.current * ICON_CLOUD_ROTATION_CONFIG.autoRotateY +
          influence.x * ICON_CLOUD_ROTATION_CONFIG.pointerRotateY,
        rotationX:
          tickRef.current * ICON_CLOUD_ROTATION_CONFIG.autoRotateX -
          influence.y * ICON_CLOUD_ROTATION_CONFIG.pointerRotateX,
      };
    };

    const updateDomNodes = (rotation: IconCloudRotation) => {
      const active = activeLabelsRef.current;
      points.forEach((point, index) => {
        const node = nodeRefs.current[index];
        const item = itemsRef.current[index];
        if (!node || !item) return;

        const projected = projectIconCloudPoint(point, rotation, width, height);
        const depth = (projected.z + 1) / 2;
        const isActive = active.includes(item.label);
        const opacity =
          (0.34 + depth * 0.42) * (active.length > 0 && !isActive ? 0.68 : 1);
        const visualScale = Math.max(0.78, Math.min(1.1, 0.72 + projected.scale * 0.22));

        node.style.transform =
          `translate3d(${projected.x.toFixed(2)}px, ${projected.y.toFixed(2)}px, 0) ` +
          `translate(-50%, var(--icon-cloud-anchor-y, -1.4rem)) scale(${visualScale.toFixed(3)})`;
        node.style.opacity = opacity.toFixed(3);
        node.style.zIndex = String(2 + Math.round(depth * 100));
        node.dataset.depth = projected.z.toFixed(3);
      });
    };

    const drawOrbit = (
      point: IconCloudSpherePoint,
      rotation: IconCloudRotation,
      alpha: number,
      planeAngle: number,
    ) => {
      if (!ctx) return;
      const orbit = createIconCloudOrbitPoints(point, 96, planeAngle);
      ctx.beginPath();
      orbit.forEach((orbitPoint, index) => {
        const projected = projectIconCloudPoint(orbitPoint, rotation, width, height);
        if (index === 0) ctx.moveTo(projected.x, projected.y);
        else ctx.lineTo(projected.x, projected.y);
      });
      ctx.globalAlpha = alpha;
      ctx.lineWidth = ICON_CLOUD_ORBIT_CONFIG.lineWidth;
      ctx.stroke();
    };

    const draw = (now = performance.now()) => {
      if (!ctx) return;
      const border = cssVar("--color-border", "#2f2a22");
      const accent = cssVar("--color-accent-strong", "#e1bd68");
      const cool = cssVar("--color-cool", "#7ec5d6");
      const rotation = getRotation(now);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, width, height);

      points
        .filter((_, index) => index % 3 === 0)
        .slice(0, ICON_CLOUD_VISIBLE_ORBIT_COUNT)
        .forEach((point, index) => {
          const projected = projectIconCloudPoint(point, rotation, width, height);
          const depth = (projected.z + 1) / 2;
          const depthAlpha =
            ICON_CLOUD_ORBIT_CONFIG.backAlpha +
            depth * (ICON_CLOUD_ORBIT_CONFIG.frontAlpha - ICON_CLOUD_ORBIT_CONFIG.backAlpha);
          ctx!.strokeStyle = index % 3 === 0 ? accent : index % 3 === 1 ? cool : border;
          drawOrbit(
            point,
            rotation,
            index % 2 === 0 ? depthAlpha : depthAlpha * 0.72,
            index * 0.73,
          );
        });

      ctx.restore();
      updateDomNodes(rotation);
      root.dataset.rotationTick = tickRef.current.toFixed(2);
      root.dataset.activeLabel = activeLabelsRef.current.join(",");
    };
    drawRef.current = () => draw();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(260, rect.width);
      height = Math.max(260, rect.height || rect.width);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      draw();
    };

    const shouldRun = () =>
      mounted && isIntersecting && pageVisible && !reducedMotionRef.current;

    const cancelFrame = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      lastFrameTime = null;
    };

    const animate = (now: number) => {
      animationFrame = null;
      if (!shouldRun()) return;
      if (lastFrameTime !== null) {
        const normalizedDelta = Math.min((now - lastFrameTime) / (1000 / 60), 3);
        tickRef.current += ICON_CLOUD_ROTATION_CONFIG.tickIncrement * normalizedDelta;
      }
      lastFrameTime = now;
      draw(now);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      if (reducedMotionRef.current) {
        tickRef.current = 0;
        pointer.x = 0;
        pointer.y = 0;
        pointer.active = false;
        pointer.leaveStart = 0;
        cancelFrame();
        draw();
        setAnimationState("reduced");
        return;
      }

      if (!shouldRun()) {
        cancelFrame();
        draw();
        setAnimationState("paused");
        return;
      }

      setAnimationState("running");
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };
    syncAnimationRef.current = syncAnimation;

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotionRef.current) return;
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointer.x = clampPointer((event.clientX - rect.left - rect.width / 2) / rect.width);
      pointer.y = clampPointer((event.clientY - rect.top - rect.height / 2) / rect.height);
      pointer.active = true;
      pointer.leaveStart = 0;
    };

    const handlePointerLeave = () => {
      if (reducedMotionRef.current) return;
      pointer.leaveFromX = pointer.x;
      pointer.leaveFromY = pointer.y;
      pointer.leaveStart = performance.now();
      pointer.active = false;
    };

    const handleVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible";
      syncAnimation();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = Boolean(entry?.isIntersecting);
        syncAnimation();
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(root);

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    resizeObserver?.observe(root);
    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", resize);

    resize();
    syncAnimation();

    return () => {
      mounted = false;
      cancelFrame();
      drawRef.current = null;
      syncAnimationRef.current = null;
      intersectionObserver.disconnect();
      resizeObserver?.disconnect();
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", resize);
    };
  }, [points]);

  const previewNode = (itemLabel: string) => {
    if (onNodePreview) onNodePreview(itemLabel);
    else onNodeActivate?.(itemLabel);
  };
  const toggleNode = (itemLabel: string) => {
    if (onNodeToggle) onNodeToggle(itemLabel);
    else onNodeActivate?.(itemLabel);
  };

  return (
    <div
      ref={rootRef}
      className="icon-cloud"
      role="group"
      aria-label={groupLabel}
      data-animation-state={reducedMotion ? "reduced" : "paused"}
      data-initialization-count="0"
      data-rotation-tick="0.00"
      data-active-label={activeLabels.join(",")}
    >
      <canvas ref={canvasRef} role="img" aria-label={label} className="icon-cloud-canvas" />
      <div className="icon-cloud__nodes">
        {items.map((item, index) => {
          const active = activeLabels.includes(item.label);
          const selected = selectedLabels.includes(item.label);
          return (
            <button
              key={item.label}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              type="button"
              className="icon-cloud__node focus-ring"
              aria-label={item.label}
              aria-pressed={selected}
              data-active={active ? "true" : "false"}
              data-selected={selected ? "true" : "false"}
              onPointerEnter={() => previewNode(item.label)}
              onPointerLeave={onNodePreviewEnd}
              onFocus={() => previewNode(item.label)}
              onBlur={onNodePreviewEnd}
              onClick={() => toggleNode(item.label)}
            >
              <span className="icon-cloud__visual" aria-hidden>
                <span className="icon-cloud__visual-icon" style={{ "--icon-color": item.color } as React.CSSProperties}>
                  {item.logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.logoSrc} alt="" draggable={false} />
                  ) : (
                    <span className="icon-cloud__glyph">{item.glyph}</span>
                  )}
                </span>
                <span className="icon-cloud__label">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
