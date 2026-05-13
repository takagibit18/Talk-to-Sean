"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type ShapeKind = "circle" | "polygon" | "ring";

type AmbientShape = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  kind: ShapeKind;
  phase: number;
  amplitude: number;
  rotation: number;
  spin: number;
  life: number;
  maxLife: number;
};

const SHAPE_COUNT = 20;
const LEGIBILITY_ZONE = {
  x1: 0.16,
  x2: 0.74,
  y1: 0.12,
  y2: 0.62,
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function chooseKind(index: number): ShapeKind {
  if (index % 5 === 0) return "ring";
  if (index % 3 === 0) return "polygon";
  return "circle";
}

function isInsideLegibilityZone(x: number, y: number, width: number, height: number) {
  return (
    x > width * LEGIBILITY_ZONE.x1 &&
    x < width * LEGIBILITY_ZONE.x2 &&
    y > height * LEGIBILITY_ZONE.y1 &&
    y < height * LEGIBILITY_ZONE.y2
  );
}

function getSafeCoordinate(width: number, height: number, axis: "x" | "y") {
  const value = axis === "x" ? randomBetween(0, width) : randomBetween(0, height);
  const testX = axis === "x" ? value : width * 0.82;
  const testY = axis === "y" ? value : height * 0.72;

  if (!isInsideLegibilityZone(testX, testY, width, height)) {
    return value;
  }

  return axis === "x" ? randomBetween(width * 0.76, width * 0.98) : randomBetween(height * 0.68, height * 0.94);
}

function createShape(width: number, height: number, index: number): AmbientShape {
  const side = Math.floor(Math.random() * 4);
  const size = randomBetween(18, 58);
  const speed = randomBetween(0.3, 1.2);
  let x = getSafeCoordinate(width, height, "x");
  let y = getSafeCoordinate(width, height, "y");
  let vx = randomBetween(-0.25, 0.25);
  let vy = randomBetween(-0.2, 0.2);

  if (side === 0) {
    x = -size;
    vx = speed;
  } else if (side === 1) {
    x = width + size;
    vx = -speed;
  } else if (side === 2) {
    y = -size;
    vy = speed;
  } else {
    y = height + size;
    vy = -speed;
  }

  if (isInsideLegibilityZone(x, y, width, height)) {
    y = y < height * 0.38 ? height * 0.08 : height * 0.76;
  }

  return {
    x,
    y,
    vx,
    vy,
    size,
    alpha: randomBetween(0.045, 0.11),
    kind: chooseKind(index),
    phase: randomBetween(0, Math.PI * 2),
    amplitude: randomBetween(8, 26),
    rotation: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.006, 0.006),
    life: randomBetween(0, 180),
    maxLife: randomBetween(560, 980),
  };
}

function drawPolygon(ctx: CanvasRenderingContext2D, size: number) {
  const sides = 5;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

export default function HeroAmbientCanvas() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return undefined;
    }

    let width = 0;
    let height = 0;
    let frame = 0;
    let previousTime = performance.now();
    let isVisible = document.visibilityState === "visible";
    let shapes: AmbientShape[] = [];
    const rootStyle = getComputedStyle(document.documentElement);
    const accent = rootStyle.getPropertyValue("--color-accent-strong").trim() || "#e1bd68";
    const gold = rootStyle.getPropertyValue("--color-accent").trim() || "#c99a3e";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      shapes = Array.from({ length: SHAPE_COUNT }, (_, index) => createShape(width, height, index));
    };

    const draw = (now: number) => {
      const delta = Math.min(Math.max((now - previousTime) / 16.67, 0.25), 2.4);
      previousTime = now;

      if (!isVisible) {
        frame = window.requestAnimationFrame(draw);
        return;
      }

      context.clearRect(0, 0, width, height);

      shapes = shapes.map((shape, index) => {
        const next = { ...shape };
        next.life += delta;
        next.x += next.vx * delta;
        next.y += next.vy * delta;
        next.rotation += next.spin * delta;

        if (isInsideLegibilityZone(next.x, next.y, width, height)) {
          next.y = next.y < height * 0.38 ? height * 0.08 : height * 0.74;
        }

        const offscreen =
          next.x < -next.size * 2 ||
          next.x > width + next.size * 2 ||
          next.y < -next.size * 2 ||
          next.y > height + next.size * 2;

        if (offscreen || next.life > next.maxLife) {
          return createShape(width, height, index);
        }

        const fade = Math.min(1, next.life / 90, (next.maxLife - next.life) / 120);
        const y = next.y + Math.sin(next.phase + next.life * 0.018) * next.amplitude;

        context.save();
        context.translate(next.x, y);
        context.rotate(next.rotation);
        context.globalAlpha = Math.max(0, next.alpha * fade);
        context.lineWidth = 1;
        context.strokeStyle = accent;
        context.fillStyle = index % 2 === 0 ? accent : gold;

        if (next.kind === "ring") {
          context.beginPath();
          context.arc(0, 0, next.size * 0.52, 0, Math.PI * 2);
          context.stroke();
        } else if (next.kind === "polygon") {
          drawPolygon(context, next.size * 0.46);
          context.fill();
        } else {
          context.beginPath();
          context.arc(0, 0, next.size * 0.5, 0, Math.PI * 2);
          context.fill();
        }

        context.restore();
        return next;
      });

      frame = window.requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
      previousTime = performance.now();
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div className="hero-ambient-layer" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
