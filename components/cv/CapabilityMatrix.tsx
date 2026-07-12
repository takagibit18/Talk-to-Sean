"use client";

import { Activity, Boxes, Database, Network, ServerCog } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { CVCapability, CVData } from "@/lib/cv-data";
import { MOTION_TOKENS, REVEAL_VARIANTS, STAGGER_VARIANTS } from "@/lib/motion-system";

const ICONS = {
  "agent-runtime": Network,
  evaluation: Activity,
  backend: ServerCog,
  infrastructure: Boxes,
  retrieval: Database,
} as const;

const CLOUD_TECH_RELATIONS: Record<string, string[]> = {
  Python: ["agent-runtime", "evaluation", "backend"],
  FastAPI: ["backend"],
  Pydantic: ["agent-runtime", "backend"],
  OpenAI: ["agent-runtime", "evaluation"],
  "Next.js": ["infrastructure"],
  Docker: ["infrastructure"],
  Redis: ["infrastructure"],
  Qdrant: ["retrieval"],
};

export function getCapabilitiesForTechnology(technology: string) {
  return CLOUD_TECH_RELATIONS[technology] ?? [];
}

export function getCloudTechnologiesForCapability(capabilityId: string) {
  return Object.entries(CLOUD_TECH_RELATIONS)
    .filter(([, capabilities]) => capabilities.includes(capabilityId))
    .map(([technology]) => technology);
}

export default function CapabilityMatrix({
  capabilities,
  copy,
  activeTechnologies,
  onActivate,
}: {
  capabilities: CVCapability[];
  copy: CVData["skillsUi"];
  activeTechnologies: string[];
  onActivate: (technologies: string[]) => void;
}) {
  const reducedMotion = useReducedMotion();
  const activeCapabilityIds = new Set(
    activeTechnologies.flatMap((technology) => getCapabilitiesForTechnology(technology)),
  );

  return (
    <div className="capability-matrix" data-surface-level="0">
      <div className="capability-matrix__heading">
        <div>
          <span>{copy.matrixLabel}</span>
          <p>{copy.matrixDescription}</p>
        </div>
        <span className="signal-state-label" data-state="verified">
          <span className="signal-status signal-status--verified" aria-hidden />
          {copy.verifiedLabel}
        </span>
      </div>

      <motion.div
        role="list"
        aria-label={copy.matrixLabel}
        className="capability-matrix__rows"
        initial={reducedMotion ? false : "hidden"}
        whileInView={reducedMotion ? undefined : "show"}
        viewport={{ once: true, amount: 0.2 }}
        variants={STAGGER_VARIANTS}
      >
        {capabilities.map((capability) => {
          const Icon = ICONS[capability.id];
          const active = activeCapabilityIds.has(capability.id);
          const technologies = getCloudTechnologiesForCapability(capability.id);
          return (
            <motion.div key={capability.id} role="listitem" variants={REVEAL_VARIANTS}>
              <button
                type="button"
                className="capability-row focus-ring"
                aria-label={`${capability.name}: ${capability.description}`}
                data-active={active ? "true" : "false"}
                onMouseEnter={() => onActivate(technologies)}
                onFocus={() => onActivate(technologies)}
                onClick={() => onActivate(technologies)}
              >
                <span className="capability-row__icon"><Icon size={17} aria-hidden /></span>
                <span className="capability-row__copy">
                  <strong>{capability.name}</strong>
                  <span>{capability.description}</span>
                  <span className="capability-row__tech">
                    {capability.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </span>
                </span>
                <span className="capability-row__state">
                  <span className={`signal-status signal-status--${active ? "processing" : "verified"}`} aria-hidden />
                  {active ? copy.activeLabel : copy.verifiedLabel}
                </span>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
