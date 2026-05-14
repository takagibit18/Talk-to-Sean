"use client";

import { motion, useReducedMotion } from "framer-motion";

type TextHoverEffectProps = {
  text: string;
};

export default function TextHoverEffect({ text }: TextHoverEffectProps) {
  const reducedMotion = useReducedMotion();

  return (
    <span data-text-hover-effect className="text-hover-effect">
      <span className="text-hover-effect__base">{text}</span>
      <motion.span
        aria-hidden
        className="text-hover-effect__stroke"
        initial={false}
        whileHover={reducedMotion ? undefined : { x: 4, y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {text}
      </motion.span>
      <span aria-hidden className="text-hover-effect__fill">
        {text}
      </span>
    </span>
  );
}
