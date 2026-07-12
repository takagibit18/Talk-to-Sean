import type { Transition, Variants } from "framer-motion";

export const MOTION_TOKENS = {
  duration: {
    fast: 0.18,
    normal: 0.28,
    slow: 0.46,
    ambient: 8,
  },
  ease: [0.22, 0.68, 0.2, 1] as const,
  hoverLift: -3,
  pressScale: 0.985,
  stagger: 0.07,
} as const;

export const MOTION_TRANSITIONS = {
  fast: { duration: MOTION_TOKENS.duration.fast, ease: MOTION_TOKENS.ease },
  normal: { duration: MOTION_TOKENS.duration.normal, ease: MOTION_TOKENS.ease },
  slow: { duration: MOTION_TOKENS.duration.slow, ease: MOTION_TOKENS.ease },
} satisfies Record<string, Transition>;

export const REVEAL_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: MOTION_TRANSITIONS.slow,
  },
} satisfies Variants;

export const STAGGER_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: MOTION_TOKENS.stagger } },
} satisfies Variants;

export type SignalState = "idle" | "processing" | "verified" | "stable";

