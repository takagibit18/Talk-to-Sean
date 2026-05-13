"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const SECTION_EASE = [0.22, 0.68, 0.2, 1] as const;

export default function SectionReveal({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -30% 0px" }}
      transition={{ duration: 0.65, ease: SECTION_EASE }}
    >
      {children}
    </motion.div>
  );
}
