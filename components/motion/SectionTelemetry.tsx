"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

export type SectionTelemetryItem = {
  id: string;
  label: string;
};

export default function SectionTelemetry({ items }: { items: SectionTelemetryItem[] }) {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeIndex = Math.max(
    items.findIndex((item) => item.id === activeId),
    0,
  );

  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined") {
      return undefined;
    }

    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const probeY = window.scrollY + window.innerHeight * 0.42;
      const next =
        items.findLast((item) => {
          const section = document.getElementById(item.id);
          return section
            ? section.getBoundingClientRect().top + window.scrollY <= probeY
            : false;
        }) ?? items[0];

      setActiveId(next.id);
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
      <span className="section-telemetry__rail" aria-hidden />
      {!reducedMotion && (
        <span
          className="section-telemetry__packet"
          aria-hidden
          style={{ "--telemetry-index": activeIndex } as CSSProperties}
        />
      )}
      {items.map((item, index) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="section-telemetry__node focus-ring"
          aria-label={item.label}
          aria-current={item.id === activeId ? "location" : undefined}
          data-label={item.label}
          style={{ "--telemetry-node-index": index } as CSSProperties}
        />
      ))}
    </nav>
  );
}
