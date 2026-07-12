"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FluidSim } from "./fluid-cursor/fluid-sim";
import { createMouseTracker } from "./fluid-cursor/mouse-tracker";
import { createWebGL2Context, resizeCanvas } from "./fluid-cursor/webgl-context";
import type { FluidCursorConfig, ThemeState, MouseState } from "./fluid-cursor/types";
import { DEFAULT_FLUID_CONFIG } from "./fluid-cursor/types";

const MEDIA_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px)";

/** SSR-safe default — overwritten by useEffect on client mount. */
function getDefaultTheme(): ThemeState {
  const cfg = DEFAULT_FLUID_CONFIG;
  return { isLight: false, blendMode: 0, accent: cfg.accentDark, glow: cfg.accentDarkGlow };
}

function detectTheme(): ThemeState {
  if (typeof document === "undefined") return getDefaultTheme();
  const isLight = document.documentElement.classList.contains("light");
  const cfg = DEFAULT_FLUID_CONFIG;
  return isLight
    ? { isLight: true, blendMode: 1, accent: cfg.accentLight, glow: cfg.accentLightGlow }
    : { isLight: false, blendMode: 0, accent: cfg.accentDark, glow: cfg.accentDarkGlow };
}

interface FluidCursorProps {
  config?: Partial<FluidCursorConfig>;
}

export default function FluidCursor({ config = {} }: FluidCursorProps) {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<FluidSim | null>(null);
  const trackerRef = useRef<ReturnType<typeof createMouseTracker> | null>(null);
  const rafRef = useRef(0);
  const prevTimeRef = useRef(0);
  const themeRef = useRef<ThemeState>(detectTheme());
  const mergedConfig = { ...DEFAULT_FLUID_CONFIG, ...config };

  // Check media query (client-side only)
  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") {
      setEnabled(false);
      return;
    }

    const mq = window.matchMedia(MEDIA_QUERY);
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reducedMotion]);

  // Theme observer
  useEffect(() => {
    if (!enabled) return;
    themeRef.current = detectTheme();

    const observer = new MutationObserver(() => {
      themeRef.current = detectTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [enabled]);

  // WebGL initialization and render loop
  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGL2RenderingContext;
    let sim: FluidSim;
    let tracker: ReturnType<typeof createMouseTracker>;

    try {
      gl = createWebGL2Context(canvas);
    } catch {
      // WebGL2 not supported — silently skip
      setEnabled(false);
      return;
    }

    resizeCanvas(gl, canvas, mergedConfig);

    sim = new FluidSim(gl, mergedConfig);
    simRef.current = sim;

    tracker = createMouseTracker({
      enabled: true,
      onFrame: (_state: MouseState) => {
        // Mouse state is read directly in the RAF loop
      },
    });
    tracker.attach();
    trackerRef.current = tracker;

    // Resize handler
    const handleResize = () => {
      resizeCanvas(gl, canvas, mergedConfig);
      sim.resize(canvas.width, canvas.height);
    };
    window.addEventListener("resize", handleResize);
    // initial sizing
    sim.resize(canvas.width, canvas.height);

    // RAF loop
    const loop = (now: number) => {
      const dt = prevTimeRef.current ? (now - prevTimeRef.current) / 1000 : 0.016;
      prevTimeRef.current = now;
      const clampedDt = Math.min(dt, 0.05);

      const mouseState = tracker.state;
      sim.step(clampedDt, now * 0.001, mouseState);

      // Clear the canvas with transparent background
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      sim.render(themeRef.current);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      tracker.detach();
      sim.destroy();
      simRef.current = null;
      trackerRef.current = null;
    };
  }, [enabled, mergedConfig.simResolution]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fluid-cursor-canvas"
      aria-hidden="true"
    />
  );
}
