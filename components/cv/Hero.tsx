"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, FileDown, GitBranch, MessageCircle } from "lucide-react";
import TextHoverEffect from "@/components/motion/TextHoverEffect";
import FluidCursor from "@/components/motion/FluidCursor";
import { useSignalCycle } from "@/components/motion/useSignalCycle";
import type { CVData } from "@/lib/cv-data";
import { MOTION_FEATURE_FLAGS } from "@/lib/motion-feature-flags";
import {
  MOTION_TOKENS,
  MOTION_TRANSITIONS,
  SIGNAL_CYCLE_TIMINGS,
  STAGGER_VARIANTS,
} from "@/lib/motion-system";

interface HeroProps {
  data: CVData;
  talkToSeanUrl: string | null;
}

export default function Hero({ data, talkToSeanUrl }: HeroProps) {
  const reducedMotion = useReducedMotion();
  const isExternalChat = talkToSeanUrl ? !talkToSeanUrl.startsWith("/") : false;
  const agentStepListRef = useRef<HTMLDivElement>(null);
  const agentStepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [agentLineStyle, setAgentLineStyle] = useState<CSSProperties>({});
  const traceCycle = useSignalCycle({
    reducedMotion,
    autoStart: true,
    ...SIGNAL_CYCLE_TIMINGS.hero,
  });
  const traceState = traceCycle.state;
  const traceStatusLabel =
    traceState === "processing"
      ? data.hero.processingLabel
      : data.hero.verifiedResultLabel;

  useEffect(() => {
    const list = agentStepListRef.current;
    const firstStep = agentStepRefs.current[0];
    const lastStep = agentStepRefs.current[data.hero.proofPoints.length - 1];
    if (!list || !firstStep || !lastStep || typeof window === "undefined") return undefined;

    const updateLineBounds = () => {
      const listRect = list.getBoundingClientRect();
      const firstRect = firstStep.getBoundingClientRect();
      const lastRect = lastStep.getBoundingClientRect();
      setAgentLineStyle({
        "--agent-line-top": `${Math.max(0, firstRect.top - listRect.top + firstRect.height / 2)}px`,
        "--agent-line-bottom": `${Math.max(0, listRect.bottom - (lastRect.top + lastRect.height / 2))}px`,
      } as CSSProperties);
    };
    updateLineBounds();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateLineBounds);
    observer?.observe(list);
    agentStepRefs.current.forEach((step) => step && observer?.observe(step));
    window.addEventListener("resize", updateLineBounds);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateLineBounds);
    };
  }, [data.hero.proofPoints.length]);

  const childVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: MOTION_TRANSITIONS.slow },
  };

  return (
    <section className="cv-hero" aria-labelledby="hero-title">
      {MOTION_FEATURE_FLAGS.fluidCursor ? <FluidCursor /> : null}
      <motion.div
        className="cv-hero__layout"
        initial={reducedMotion ? false : "hidden"}
        animate={reducedMotion ? undefined : "show"}
        variants={STAGGER_VARIANTS}
      >
        <div className="cv-hero__content">
          <motion.div variants={childVariants} className="cv-availability">
            <span className="cv-status-dot" aria-hidden />
            <span>{data.hero.availability}</span>
          </motion.div>

          <motion.h1 id="hero-title" variants={childVariants} className="cv-hero-name" aria-label={data.hero.name}>
            <TextHoverEffect text={data.hero.name} />
          </motion.h1>

          <motion.p variants={childVariants} className="cv-hero__role">
            <strong>{data.hero.role}</strong>{" "}
            <span>{data.hero.location}</span>
          </motion.p>

          <motion.div variants={childVariants} className="cv-hero__actions">
            <a href="#projects" className="cv-cta cv-cta-primary focus-ring text-sm">
              {data.nav.exploreProjects}
              <ArrowDown size={14} aria-hidden />
            </a>
            {talkToSeanUrl && (
              <a
                href={talkToSeanUrl}
                target={isExternalChat ? "_blank" : undefined}
                rel={isExternalChat ? "noopener noreferrer" : undefined}
                className="cv-cta cv-cta--cool focus-ring text-sm"
              >
                <MessageCircle size={15} aria-hidden />
                {data.hero.talkToSean}
                <ArrowUpRight size={13} aria-hidden />
              </a>
            )}
            <a href="/cv.pdf" className="cv-hero-cv-link focus-ring">
              <FileDown size={14} aria-hidden />
              {data.nav.downloadCv}
            </a>
          </motion.div>
        </div>

        <motion.div
          variants={childVariants}
          className="cv-hero-trace"
          data-motion-state={traceState}
          data-surface-level="2"
          tabIndex={0}
          aria-label={data.hero.labTitle}
          onPointerEnter={() => traceCycle.replay()}
          onFocus={() => traceCycle.replay()}
        >
          <div className="cv-system-heading">
            <div>
              <span>{data.hero.labTitle}</span>
              <p>{data.hero.labSubtitle}</p>
            </div>
            <div className="cv-system-state" data-state={traceState}>
              <GitBranch size={16} aria-hidden />
              <span>{traceStatusLabel}</span>
            </div>
          </div>

          <div ref={agentStepListRef} className="cv-agent-step-list" style={agentLineStyle}>
            <span className="cv-agent-link-line" aria-hidden />
            <span className="cv-agent-link-flow" aria-hidden />
            <span className="cv-agent-link-dot" aria-hidden />
            {data.hero.proofPoints.map((item, index) => (
              <div
                key={item.label}
                ref={(node) => {
                  agentStepRefs.current[index] = node;
                }}
                className="cv-agent-step"
                data-state={traceState}
                style={{ "--signal-delay": `${index * MOTION_TOKENS.duration.normal}s` } as CSSProperties}
              >
                <span className="cv-agent-step-node" aria-hidden />
                <span className="cv-agent-step-label">{item.label}</span>
                <div>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="cv-hero-trace__result" data-state={traceState}>
            <span className={`signal-status signal-status--${traceState}`} aria-hidden />
            <span>{data.hero.verifiedResultLabel}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
