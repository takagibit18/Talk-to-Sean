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
};

type SpherePoint = {
  x: number;
  y: number;
  z: number;
};

const DEFAULT_LABEL = "Interactive technology icon cloud";

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
  lineWidth: 1.25,
  backAlpha: 0.13,
  frontAlpha: 0.32,
} as const;

export function getIconCloudPointerDecay(
  elapsedMs: number,
  durationMs = ICON_CLOUD_ROTATION_CONFIG.pointerLeaveDecayMs,
) {
  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  return Math.pow(1 - progress, 3);
}

export function createIconCloudOrbitPoints(
  anchorPoint: SpherePoint,
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

  return Array.from({ length: segments + 1 }, (_, index): SpherePoint => {
    const theta = (Math.PI * 2 * index) / segments;
    return {
      x: anchor.x * Math.cos(theta) + orbitTangent.x * Math.sin(theta),
      y: anchor.y * Math.cos(theta) + orbitTangent.y * Math.sin(theta),
      z: anchor.z * Math.cos(theta) + orbitTangent.z * Math.sin(theta),
    };
  });
}

function crossPoint(a: SpherePoint, b: SpherePoint): SpherePoint {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalizePoint(point: SpherePoint): SpherePoint {
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

  return Array.from({ length: count }, (_, index): SpherePoint => {
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

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function cssVar(name: string, fallback: string) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  );
}

type LogoCacheEntry = {
  image: HTMLImageElement;
  loaded: boolean;
  failed: boolean;
};

export default function IconCloud({ items, label = DEFAULT_LABEL }: IconCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const points = useMemo(() => createSpherePoints(items.length), [items.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) {
      return;
    }

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }

    if (!ctx) {
      return;
    }

    let animationFrame = 0;
    let tick = 0;
    let width = 320;
    let height = 320;
    let dpr = 1;
    const logoCache = new Map<string, LogoCacheEntry>();
    const pointer = {
      x: 0,
      y: 0,
      active: false,
      leaveStart: 0,
      leaveFromX: 0,
      leaveFromY: 0,
    };

    const getPointerInfluence = (now: number) => {
      if (reducedMotion) {
        return { x: 0, y: 0 };
      }

      if (pointer.active) {
        return { x: pointer.x, y: pointer.y };
      }

      if (pointer.leaveStart === 0) {
        return { x: 0, y: 0 };
      }

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

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(260, rect.width);
      height = Math.max(260, rect.height || rect.width);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      draw();
    };

    const getLogo = (src: string) => logoCache.get(src);

    const preloadLogos = () => {
      const uniqueSources = Array.from(
        new Set(items.map((item) => item.logoSrc).filter(Boolean)),
      ) as string[];

      uniqueSources.forEach((src) => {
        if (logoCache.has(src)) {
          return;
        }

        const image = new Image();
        const entry: LogoCacheEntry = {
          image,
          loaded: false,
          failed: false,
        };

        image.onload = () => {
          entry.loaded = true;
          draw();
        };
        image.onerror = () => {
          entry.failed = true;
          draw();
        };
        image.decoding = "async";
        image.src = src;
        logoCache.set(src, entry);
      });
    };

    const getRotation = (pointerInfluence: { x: number; y: number }) => {
      const rotationY =
        tick * ICON_CLOUD_ROTATION_CONFIG.autoRotateY +
        pointerInfluence.x * ICON_CLOUD_ROTATION_CONFIG.pointerRotateY;
      const rotationX =
        tick * ICON_CLOUD_ROTATION_CONFIG.autoRotateX -
        pointerInfluence.y * ICON_CLOUD_ROTATION_CONFIG.pointerRotateX;

      return { rotationX, rotationY };
    };

    const projectPoint = (
      point: SpherePoint,
      rotation: { rotationX: number; rotationY: number },
    ) => {
      const { rotationX, rotationY } = rotation;
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
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
    };

    const project = (
      point: SpherePoint,
      index: number,
      rotation: { rotationX: number; rotationY: number },
    ) => ({
      item: items[index],
      ...projectPoint(point, rotation),
    });

    const drawOrbit = (
      point: SpherePoint,
      rotation: { rotationX: number; rotationY: number },
      alpha: number,
      planeAngle: number,
    ) => {
      if (!ctx) {
        return;
      }

      const orbit = createIconCloudOrbitPoints(point, 96, planeAngle);
      const projectedOrbit = orbit.map((orbitPoint) => projectPoint(orbitPoint, rotation));

      ctx.beginPath();
      projectedOrbit.forEach((orbitPoint, index) => {
        if (index === 0) {
          ctx.moveTo(orbitPoint.x, orbitPoint.y);
          return;
        }

        ctx.lineTo(orbitPoint.x, orbitPoint.y);
      });

      ctx.globalAlpha = alpha;
      ctx.lineWidth = ICON_CLOUD_ORBIT_CONFIG.lineWidth;
      ctx.stroke();
    };

    function draw(now = performance.now()) {
      if (!ctx) {
        return;
      }

      const bg = cssVar("--color-bg-elevated", "#17140f");
      const border = cssVar("--color-border", "#2f2a22");
      const accent = cssVar("--color-accent-strong", "#e1bd68");
      const cool = cssVar("--color-cool", "#7ec5d6");
      const pointerInfluence = getPointerInfluence(now);
      const rotation = getRotation(pointerInfluence);
      const cloudItems = points
        .map((point, index) => project(point, index, rotation))
        .sort((a, b) => a.z - b.z);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, width, height);

      points.forEach((point, index) => {
        const projected = projectPoint(point, rotation);
        const depth = (projected.z + 1) / 2;
        const depthAlpha =
          ICON_CLOUD_ORBIT_CONFIG.backAlpha +
          depth * (ICON_CLOUD_ORBIT_CONFIG.frontAlpha - ICON_CLOUD_ORBIT_CONFIG.backAlpha);
        ctx.strokeStyle = index % 3 === 0 ? accent : index % 3 === 1 ? cool : border;
        drawOrbit(
          point,
          rotation,
          index % 2 === 0 ? depthAlpha : depthAlpha * 0.72,
          index * 0.73,
        );
      });

      cloudItems.forEach(({ item, x, y, z, scale }) => {
        const logo = item.logoSrc ? getLogo(item.logoSrc) : undefined;
        const logoAspect =
          logo?.loaded && logo.image.naturalHeight > 0
            ? logo.image.naturalWidth / logo.image.naturalHeight
            : 1;
        const hasLogo = Boolean(logo?.loaded && !logo.failed);
        const size = Math.max(30, Math.min(48, 26 * scale));
        const alpha = 0.48 + ((z + 1) / 2) * 0.5;
        const chipWidth = hasLogo
          ? Math.min(96, Math.max(size, size * Math.min(logoAspect, 1.95) * 0.92))
          : size;
        const chipHeight = size;
        const chipX = x - chipWidth / 2;
        const chipY = y - chipHeight / 2;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = bg;
        roundedRect(ctx, chipX, chipY, chipWidth, chipHeight, chipHeight / 2);
        ctx.fill();

        ctx.strokeStyle = item.color;
        ctx.globalAlpha = alpha * 0.76;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        if (hasLogo && logo) {
          const plateSize = chipHeight * 0.76;
          const plateX = x - plateSize / 2;
          const plateY = y - plateSize / 2;
          ctx.globalAlpha = alpha * 0.92;
          ctx.fillStyle = "rgba(255, 250, 242, 0.92)";
          roundedRect(ctx, plateX, plateY, plateSize, plateSize, plateSize * 0.28);
          ctx.fill();

          const logoMaxWidth = chipWidth * 0.72;
          const logoMaxHeight = chipHeight * 0.68;
          const logoScale = Math.min(
            logoMaxWidth / logo.image.naturalWidth,
            logoMaxHeight / logo.image.naturalHeight,
          );
          const logoWidth = logo.image.naturalWidth * logoScale;
          const logoHeight = logo.image.naturalHeight * logoScale;

          ctx.globalAlpha = alpha;
          ctx.drawImage(
            logo.image,
            x - logoWidth / 2,
            y - logoHeight / 2,
            logoWidth,
            logoHeight,
          );
          return;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(x, y, chipHeight * 0.34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = `700 ${Math.max(9, chipHeight * 0.3)}px var(--font-space-grotesk), sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.glyph, x, y + 0.5);
      });

      ctx.restore();
    }

    const animate = () => {
      if (!reducedMotion) {
        tick += ICON_CLOUD_ROTATION_CONFIG.tickIncrement;
      }
      draw();
      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      pointer.x = clampPointer((event.clientX - rect.left - rect.width / 2) / rect.width);
      pointer.y = clampPointer((event.clientY - rect.top - rect.height / 2) / rect.height);
      pointer.active = true;
      pointer.leaveStart = 0;
    };

    const handlePointerLeave = () => {
      if (reducedMotion) {
        return;
      }

      pointer.leaveFromX = pointer.x;
      pointer.leaveFromY = pointer.y;
      pointer.leaveStart = performance.now();
      pointer.active = false;
    };

    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(canvas);

    preloadLogos();
    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      logoCache.forEach(({ image }) => {
        image.onload = null;
        image.onerror = null;
      });
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [items, points, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="icon-cloud-canvas"
    />
  );
}
