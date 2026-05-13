"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";

const CHIP_EASE = [0.22, 0.68, 0.2, 1] as const;

const clusterVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.075,
    },
  },
};

const chipVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.92,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: CHIP_EASE,
    },
  },
};

export default function Skills({ data }: { data: CVData }) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="skills" className="cv-section">
      <SectionHeader number="02" label={data.sections.skills} />
      <motion.div
        className="flex flex-col"
        initial={reducedMotion ? false : "hidden"}
        whileInView={reducedMotion ? "show" : "show"}
        viewport={{ once: true, amount: 0.3 }}
        variants={clusterVariants}
      >
        {data.skills.map((group) => (
          <motion.div key={group.group} className="cv-skill-cluster" variants={clusterVariants}>
            <div>
              <strong className="cv-skill-heading">{group.group}</strong>
            </div>
            <motion.div className="flex flex-wrap gap-2.5" variants={clusterVariants}>
              {group.items.map((item) => (
                <motion.span
                  key={item}
                  className="cv-chip will-change-transform"
                  variants={reducedMotion ? undefined : chipVariants}
                  whileHover={{
                    y: -3,
                    scale: 1.03,
                    boxShadow: "0 0 8px var(--color-accent-strong, rgba(234,201,119,0.4))",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
