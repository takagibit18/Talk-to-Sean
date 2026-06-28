"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

export type SectionTelemetryItem = {
  id: string;
  label: string;
};

type ScrollDirection = -1 | 0 | 1;

type TelemetryState = {
  activeId: string;
  activeIndex: number;
  progress: number;
  direction: ScrollDirection;
};

export type TelemetryNodeMotion = {
  scaleX: number;
  scaleY: number;
  opacity: number;
  shiftY: number;
  focus: number;
};

export type TelemetryNodeMotionInput = {
  index: number;
  activeIndex: number;
  progress: number;
  direction: ScrollDirection;
  total: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundMotion(value: number): number {
  return Number(value.toFixed(3));
}

export function getTelemetryNodeMotion({
  index,
  activeIndex,
  progress,
  direction,
  total,
}: TelemetryNodeMotionInput): TelemetryNodeMotion {
  const safeTotal = Math.max(total, 1);
  const safeActiveIndex = clamp(activeIndex, 0, safeTotal - 1);
  const safeProgress = safeActiveIndex >= safeTotal - 1 ? 0 : clamp(progress, 0, 1);
  const nextIndex = Math.min(safeActiveIndex + 1, safeTotal - 1);
  const bridge = Math.sin(safeProgress * Math.PI);
  const virtualIndex = safeActiveIndex + safeProgress;
  const proximity = clamp(1 - Math.abs(index - virtualIndex), 0, 1);
  const shiftY = direction === 0 ? 0 : direction * bridge * proximity * 1.35;

  if (index === safeActiveIndex && nextIndex !== safeActiveIndex) {
    return {
      scaleX: 1,
      scaleY: 1,
      opacity: roundMotion(0.48 + proximity * 0.47),
      shiftY: roundMotion(shiftY),
      focus: roundMotion(proximity),
    };
  }

  if (index === nextIndex && nextIndex !== safeActiveIndex) {
    return {
      scaleX: 1,
      scaleY: 1,
      opacity: roundMotion(0.36 + proximity * 0.48),
      shiftY: roundMotion(-shiftY * 0.58),
      focus: roundMotion(proximity),
    };
  }

  return {
    scaleX: 1,
    scaleY: 1,
    opacity: roundMotion(0.34 + proximity * 0.32),
    shiftY: 0,
    focus: roundMotion(proximity),
  };
}

export default function SectionTelemetry({ items }: { items: SectionTelemetryItem[] }) {
  const reducedMotion = useReducedMotion();
  const lastScrollYRef = useRef(0);
  const directionRef = useRef<ScrollDirection>(0);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    activeId: items[0]?.id ?? "",
    activeIndex: 0,
    progress: 0,
    direction: 0,
  });

  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined") {
      return undefined;
    }

    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const nextDirection: ScrollDirection =
        scrollY === lastScrollYRef.current
          ? directionRef.current
          : scrollY > lastScrollYRef.current
            ? 1
            : -1;
      lastScrollYRef.current = scrollY;
      directionRef.current = nextDirection;
      const probeY = window.scrollY + window.innerHeight * 0.42;
      const sectionTops = items.map((item) => {
        const section = document.getElementById(item.id);
        return section ? section.getBoundingClientRect().top + window.scrollY : null;
      });
      let activeIndex = 0;
      for (let index = 0; index < sectionTops.length; index += 1) {
        const top = sectionTops[index];
        if (top !== null && top <= probeY) {
          activeIndex = index;
        }
      }

      const currentTop = sectionTops[activeIndex];
      const nextTop = sectionTops[activeIndex + 1];
      const progress =
        currentTop !== null && nextTop !== null && nextTop > currentTop
          ? clamp((probeY - currentTop) / (nextTop - currentTop), 0, 1)
          : 0;
      const activeId = items[activeIndex]?.id ?? items[0]?.id ?? "";

      setTelemetry((previous) =>
        previous.activeId === activeId &&
        previous.activeIndex === activeIndex &&
        Math.abs(previous.progress - progress) < 0.001 &&
        previous.direction === nextDirection
          ? previous
          : {
              activeId,
              activeIndex,
              progress,
              direction: nextDirection,
            },
      );
    };

    const requestUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="section-telemetry" aria-label="Page section telemetry">
      {items.map((item, index) => {
        const motion = reducedMotion
          ? {
              scaleX: 1,
              scaleY: 1,
              opacity: item.id === telemetry.activeId ? 0.95 : 0.42,
              shiftY: 0,
              focus: item.id === telemetry.activeId ? 1 : 0,
            }
          : getTelemetryNodeMotion({
              index,
              activeIndex: telemetry.activeIndex,
              progress: telemetry.progress,
              direction: telemetry.direction,
              total: items.length,
            });

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="section-telemetry__node focus-ring"
            aria-label={item.label}
            aria-current={item.id === telemetry.activeId ? "location" : undefined}
            data-label={item.label}
            title={item.label}
            style={
              {
                "--telemetry-node-index": index,
                "--telemetry-node-scale-x": String(motion.scaleX),
                "--telemetry-node-scale-y": String(motion.scaleY),
                "--telemetry-node-opacity": String(motion.opacity),
                "--telemetry-node-shift-y": `${motion.shiftY}px`,
                "--telemetry-node-focus": String(motion.focus),
              } as CSSProperties
            }
          />
        );
      })}
    </nav>
  );
}
