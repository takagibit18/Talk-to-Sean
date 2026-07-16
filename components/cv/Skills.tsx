"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Braces, PanelsTopLeft, Search, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import IconCloud, { type IconCloudItem } from "@/components/motion/IconCloud";
import CapabilityMatrix from "@/components/cv/CapabilityMatrix";
import { useSignalCycle } from "@/components/motion/useSignalCycle";
import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";
import {
  REVEAL_VARIANTS,
  SIGNAL_CYCLE_TIMINGS,
  STAGGER_VARIANTS,
} from "@/lib/motion-system";
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
  const [previewTechnologies, setPreviewTechnologies] = useState<string[] | null>(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const previewExitPendingRef = useRef(false);
  const capabilityCycle = useSignalCycle({
    reducedMotion,
    initialState: "stable",
    processingMs: 1_000,
    verifiedMs: 0,
  });
  const activeTechnologies = previewTechnologies ?? selectedTechnologies;

  useEffect(() => {
    if (
      capabilityCycle.state === "stable" &&
      previewExitPendingRef.current &&
      previewTechnologies !== null
    ) {
      previewExitPendingRef.current = false;
      setPreviewTechnologies(null);
    }
  }, [capabilityCycle.state, previewTechnologies]);

  const preview = (technologies: string[]) => {
    previewExitPendingRef.current = false;
    capabilityCycle.begin();
    setPreviewTechnologies(technologies);
  };

  const endPreview = () => {
    if (reducedMotion) {
      previewExitPendingRef.current = false;
      capabilityCycle.settle();
      setPreviewTechnologies(null);
      return;
    }
    previewExitPendingRef.current = true;
    capabilityCycle.settleAfter(SIGNAL_CYCLE_TIMINGS.capability.exitDelayMs);
  };

  const toggleSelection = (technologies: string[]) => {
    previewExitPendingRef.current = false;
    capabilityCycle.settle();
    setPreviewTechnologies(null);
    setSelectedTechnologies((current) =>
      current.length === technologies.length &&
      current.every((technology, index) => technology === technologies[index])
        ? []
        : technologies,
    );
  };

  const signalLabel =
    capabilityCycle.state === "processing"
      ? data.skillsUi.processingLabel
      : data.skillsUi.verifiedLabel;

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
              <span className="signal-state-label" data-state={capabilityCycle.state}>
                <span className={`signal-status signal-status--${capabilityCycle.state}`} aria-hidden />
                {signalLabel}
              </span>
            </div>
            <div className="cv-icon-cloud-wrap">
              <IconCloud
                items={TECH_STACK_ICONS}
                label={data.skillsUi.cloudVisualLabel}
                groupLabel={data.skillsUi.ecosystemLabel}
                activeLabels={activeTechnologies}
                selectedLabels={selectedTechnologies}
                onNodePreview={(label) => preview([label])}
                onNodePreviewEnd={endPreview}
                onNodeToggle={(label) => toggleSelection([label])}
              />
            </div>
          </div>

          <CapabilityMatrix
            capabilities={data.capabilities}
            copy={data.skillsUi}
            activeTechnologies={activeTechnologies}
            selectedTechnologies={selectedTechnologies}
            signalState={capabilityCycle.state}
            onPreview={preview}
            onPreviewEnd={endPreview}
            onToggle={toggleSelection}
          />
        </div>
      </div>
    </section>
  );
}
