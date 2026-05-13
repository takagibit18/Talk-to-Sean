"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export default function ScrollProgress() {
  const reducedMotion = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const bar = barRef.current;
    if (!bar) {
      return undefined;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const requestUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
