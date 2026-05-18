"use client";

import { motion, useReducedMotion } from "framer-motion";
import IconCloud, { type IconCloudItem } from "@/components/motion/IconCloud";
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

export const TECH_STACK_ICONS = [
  { label: "Python", glyph: "Py", color: "#3776ab", logoSrc: "/tech-logos/python.png" },
  { label: "FastAPI", glyph: "FA", color: "#009688", logoSrc: "/tech-logos/fastapi.png" },
  { label: "Pydantic", glyph: "Pd", color: "#7b2cbf", logoSrc: "/tech-logos/pydantic.png" },
  { label: "pytest", glyph: "Pt", color: "#0a9edc", logoSrc: "/tech-logos/pytest.png" },
  { label: "Next.js", glyph: "Nx", color: "#111111", logoSrc: "/tech-logos/nextjs.png" },
  { label: "TypeScript", glyph: "TS", color: "#3178c6", logoSrc: "/tech-logos/typescript.png" },
  { label: "MySQL", glyph: "SQL", color: "#4479a1", logoSrc: "/tech-logos/mysql.png" },
  { label: "Redis", glyph: "Rs", color: "#dc382d", logoSrc: "/tech-logos/redis.png" },
  { label: "Docker", glyph: "Dk", color: "#2496ed", logoSrc: "/tech-logos/docker.png" },
  { label: "OpenAI", glyph: "AI", color: "#111111", logoSrc: "/tech-logos/openai.png" },
  { label: "LangChain", glyph: "LC", color: "#1c3c3c", logoSrc: "/tech-logos/langchain.png" },
  { label: "GitHub", glyph: "GH", color: "#111111", logoSrc: "/tech-logos/github.png" },
] satisfies IconCloudItem[];

export default function Skills({ data }: { data: CVData }) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="skills" className="cv-section">
      <SectionHeader number="02" label={data.sections.skills} />
      <div className="cv-skills-layout">
        <motion.div
          className="flex flex-col"
          initial={reducedMotion ? false : "hidden"}
          whileInView={reducedMotion ? "show" : "show"}
          viewport={{ once: true, amount: 0.3 }}
          variants={clusterVariants}
        >
          {data.skills.map((group, groupIndex) => (
            <motion.div key={groupIndex} className="cv-skill-cluster" variants={clusterVariants}>
              <div>
                <strong className="cv-skill-heading">{group.group}</strong>
              </div>
              <motion.div className="flex flex-wrap gap-2.5" variants={clusterVariants}>
                {group.items.map((item, itemIndex) => (
                  <motion.span
                    key={itemIndex}
                    className="cv-chip will-change-transform"
                    variants={reducedMotion ? undefined : chipVariants}
                    whileHover={{
                      y: -3,
                      scale: 1.03,
                      boxShadow: "0 0 8px var(--color-accent-strong, rgba(234,201,119,0.4))",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 35 }}
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <div className="cv-icon-cloud-wrap">
          <IconCloud items={TECH_STACK_ICONS} />
        </div>
      </div>
    </section>
  );
}
