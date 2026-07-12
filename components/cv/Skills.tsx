"use client";

import { useState } from "react";
import { Bot, Braces, PanelsTopLeft, Search, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import IconCloud, { type IconCloudItem } from "@/components/motion/IconCloud";
import CapabilityMatrix from "@/components/cv/CapabilityMatrix";
import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";
import { REVEAL_VARIANTS, STAGGER_VARIANTS } from "@/lib/motion-system";
import { getHomeSectionNumber } from "@/lib/home-sections";

const GROUP_ICONS = [Braces, PanelsTopLeft, Bot, Search, Wrench];

export const TECH_STACK_ICONS = [
  { label: "Python", glyph: "Py", color: "#3776ab", logoSrc: "/tech-logos/python.png" },
  { label: "FastAPI", glyph: "FA", color: "#009688", logoSrc: "/tech-logos/fastapi.png" },
  { label: "Pydantic", glyph: "Pd", color: "#7b2cbf", logoSrc: "/tech-logos/pydantic.png" },
  { label: "OpenAI", glyph: "AI", color: "#f4ead8", logoSrc: "/tech-logos/openai.png" },
  { label: "Next.js", glyph: "Nx", color: "#f4ead8", logoSrc: "/tech-logos/nextjs.png" },
  { label: "Docker", glyph: "Dk", color: "#2496ed", logoSrc: "/tech-logos/docker.png" },
  { label: "Redis", glyph: "Rs", color: "#dc382d", logoSrc: "/tech-logos/redis.png" },
  { label: "Qdrant", glyph: "Qd", color: "#dc244c" },
] satisfies IconCloudItem[];

export default function Skills({ data }: { data: CVData }) {
  const reducedMotion = useReducedMotion();
  const [activeTechnologies, setActiveTechnologies] = useState<string[]>([]);

  return (
    <section id="skills" className="cv-section">
      <SectionHeader number={getHomeSectionNumber("skills")} label={data.sections.skills} />
      <div className="cv-skills-layout">
        <motion.div
          className="cv-skill-groups"
          aria-label={data.skillsUi.stackLabel}
          initial={reducedMotion ? false : "hidden"}
          whileInView={reducedMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.16 }}
          variants={STAGGER_VARIANTS}
        >
          {data.skills.map((group, groupIndex) => {
            const Icon = GROUP_ICONS[groupIndex] || Wrench;
            return (
              <motion.div key={group.group} className="cv-skill-cluster" variants={REVEAL_VARIANTS}>
                <strong className="cv-skill-heading"><Icon size={17} aria-hidden />{group.group}</strong>
                <div className="cv-skill-chips">
                  {group.items.map((item) => (
                    <span key={item} className="cv-chip">{item}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="cv-skills-system">
          <div className="cv-icon-cloud-panel" data-surface-level="2">
            <div className="cv-skills-system__heading">
              <div>
                <span>{data.skillsUi.ecosystemLabel}</span>
                <p>{data.skillsUi.ecosystemDescription}</p>
              </div>
              <span className="signal-state-label" data-state="processing">
                <span className="signal-status signal-status--processing" aria-hidden />
                {data.skillsUi.processingLabel}
              </span>
            </div>
            <div className="cv-icon-cloud-wrap">
              <IconCloud
                items={TECH_STACK_ICONS}
                label={data.skillsUi.cloudVisualLabel}
                groupLabel={data.skillsUi.ecosystemLabel}
                activeLabels={activeTechnologies}
                onNodeActivate={(label) => setActiveTechnologies([label])}
              />
            </div>
          </div>

          <CapabilityMatrix
            capabilities={data.capabilities}
            copy={data.skillsUi}
            activeTechnologies={activeTechnologies}
            onActivate={setActiveTechnologies}
          />
        </div>
      </div>
    </section>
  );
}
