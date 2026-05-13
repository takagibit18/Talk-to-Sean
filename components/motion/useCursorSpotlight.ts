"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const SPOTLIGHT_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const SPOTLIGHT_RADIUS = 180;
const LERP_FACTOR = 0.1;

export function useCursorSpotlight<T extends HTMLElement>() {
  const reducedMotion = useReducedMotion();
  const hostRef = useRef<T>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") {
      return undefined;
    }

    const host = hostRef.current;
    const spotlight = spotlightRef.current;
    if (!host || !spotlight) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(SPOTLIGHT_QUERY);
    let enabled = mediaQuery.matches;
    let frame = 0;
    let rect = host.getBoundingClientRect();
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const updateRect = () => {
      rect = host.getBoundingClientRect();
    };

    const animate = () => {
      currentX += (targetX - currentX) * LERP_FACTOR;
      currentY += (targetY - currentY) * LERP_FACTOR;
      spotlight.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
      }
    };

    const requestAnimate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const handleMove = (event: MouseEvent) => {
      if (!enabled) {
        return;
      }

      targetX = event.clientX - rect.left - SPOTLIGHT_RADIUS;
      targetY = event.clientY - rect.top - SPOTLIGHT_RADIUS;
      spotlight.style.opacity = "1";
      requestAnimate();
    };

    const handleEnter = () => {
      updateRect();
    };

    const handleLeave = () => {
      spotlight.style.opacity = "0";
    };

    const handleMediaChange = () => {
      enabled = mediaQuery.matches;
      spotlight.style.opacity = enabled ? spotlight.style.opacity : "0";
    };

    window.addEventListener("resize", updateRect, { passive: true });
    host.addEventListener("mouseenter", handleEnter);
    host.addEventListener("mousemove", handleMove);
    host.addEventListener("mouseleave", handleLeave);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", updateRect);
      host.removeEventListener("mouseenter", handleEnter);
      host.removeEventListener("mousemove", handleMove);
      host.removeEventListener("mouseleave", handleLeave);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [reducedMotion]);

  return { hostRef, spotlightRef };
}
