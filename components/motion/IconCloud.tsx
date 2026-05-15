"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export type IconCloudItem = {
  label: string;
  glyph: string;
  color: string;
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

export function getIconCloudPointerDecay(
  elapsedMs: number,
  durationMs = ICON_CLOUD_ROTATION_CONFIG.pointerLeaveDecayMs,
) {
  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  return Math.pow(1 - progress, 3);
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

    const project = (
      point: SpherePoint,
      index: number,
      pointerInfluence: { x: number; y: number },
    ) => {
      const rotationY =
        tick * ICON_CLOUD_ROTATION_CONFIG.autoRotateY +
        pointerInfluence.x * ICON_CLOUD_ROTATION_CONFIG.pointerRotateY;
      const rotationX =
        tick * ICON_CLOUD_ROTATION_CONFIG.autoRotateX -
        pointerInfluence.y * ICON_CLOUD_ROTATION_CONFIG.pointerRotateX;
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
        item: items[index],
        x: width / 2 + x1 * radius * scale,
        y: height / 2 + y1 * radius * scale,
        z: z2,
        scale,
      };
    };

    function draw(now = performance.now()) {
      if (!ctx) {
        return;
      }

      const bg = cssVar("--color-bg-elevated", "#17140f");
      const border = cssVar("--color-border", "#2f2a22");
      const text = cssVar("--color-text-strong", "#f4ead8");
      const muted = cssVar("--color-text-muted", "#a39b8b");
      const pointerInfluence = getPointerInfluence(now);
      const cloudItems = points
        .map((point, index) => project(point, index, pointerInfluence))
        .sort((a, b) => a.z - b.z);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.globalAlpha = 0.34;
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.beginPath();
        ctx.ellipse(
          width / 2,
          height / 2,
          width * (0.29 + ring * 0.055),
          height * (0.18 + ring * 0.035),
          ring * 0.72,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      cloudItems.forEach(({ item, x, y, z, scale }) => {
        const isFront = z > 0.15;
        const size = Math.max(30, Math.min(48, 26 * scale));
        const alpha = 0.48 + ((z + 1) / 2) * 0.5;
        const labelWidth = isFront && width > 315 ? ctx.measureText(item.label).width + 46 : size;
        const chipWidth = Math.min(132, Math.max(size, labelWidth));
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

        ctx.globalAlpha = alpha;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(chipX + chipHeight / 2, y, chipHeight * 0.34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = `700 ${Math.max(9, chipHeight * 0.3)}px var(--font-space-grotesk), sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.glyph, chipX + chipHeight / 2, y + 0.5);

        if (isFront && width > 315) {
          ctx.fillStyle = text;
          ctx.font = `600 ${Math.max(10, chipHeight * 0.28)}px var(--font-manrope), sans-serif`;
          ctx.textAlign = "left";
          ctx.fillText(item.label, chipX + chipHeight * 0.88, y + 0.5);
        }
      });

      ctx.globalAlpha = 0.72;
      ctx.fillStyle = muted;
      ctx.font = "600 11px var(--font-manrope), sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("agent stack", width / 2, height / 2);

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

    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
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
