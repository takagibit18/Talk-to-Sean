// Mouse state tracker with velocity computation and cubic fade.
// Listens to document mousemove, computes normalized UV + velocity.

import type { MouseState } from "./types";

export type MouseFrameCallback = (state: MouseState) => void;

export interface MouseTrackerOptions {
  enabled: boolean;
  onFrame: MouseFrameCallback;
}

export interface MouseTracker {
  state: MouseState;
  attach(): void;
  detach(): void;
}

export function createMouseTracker(options: MouseTrackerOptions): MouseTracker {
  const state: MouseState = {
    uv: [0, 0],
    prevUV: [0, 0],
    velocity: 0,
    active: false,
  };

  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  const IDLE_MS = 200;

  function uvFromEvent(e: MouseEvent): [number, number] {
    return [e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight];
  }

  function velocityMag(a: [number, number], b: [number, number]): number {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleMove(e: MouseEvent) {
    if (!options.enabled) return;

    const uv = uvFromEvent(e);
    state.prevUV = state.uv.slice() as [number, number];
    state.uv = uv;
    state.velocity = velocityMag(state.prevUV, uv);
    state.active = true;

    // Reset idle timer
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      state.active = false;
      state.velocity = 0;
    }, IDLE_MS);
  }

  function attach() {
    document.addEventListener("mousemove", handleMove, { passive: true });
  }

  function detach() {
    document.removeEventListener("mousemove", handleMove);
    if (idleTimer) clearTimeout(idleTimer);
    state.active = false;
    state.velocity = 0;
  }

  return { state, attach, detach };
}
