"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION_TRANSITIONS, REVEAL_VARIANTS } from "@/lib/motion-system";

export default function SectionReveal({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -30% 0px" }}
      variants={REVEAL_VARIANTS}
      transition={MOTION_TRANSITIONS.slow}
    >
      {children}
    </motion.div>
  );
}
