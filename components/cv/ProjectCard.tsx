"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowUpRight, Github, Layers, ListChecks } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArchitectureDiagram, SignalStatus } from "@/components/motion/SignalSystem";
import { useSignalCycle } from "@/components/motion/useSignalCycle";
import type { SignalState } from "@/lib/motion-system";
import { MOTION_TOKENS, REVEAL_VARIANTS, SIGNAL_CYCLE_TIMINGS } from "@/lib/motion-system";
import type { GitHubRepo } from "@/lib/github";
import type { Locale } from "@/lib/locale";
import type { CVData } from "@/lib/cv-data";
import type { FeaturedProject } from "@/lib/project-highlights";

export default function ProjectCard({
  project,
  repo,
  locale,
  copy,
  index,
  activeProjectId,
  onSignalRequest,
  onSignalSettled,
}: {
  project: FeaturedProject;
  repo: GitHubRepo | null;
  locale: Locale;
  copy: CVData["projects"];
  index: number;
  activeProjectId: string | null;
  onSignalRequest: (projectId: string, source: "viewport" | "interaction") => void;
  onSignalSettled: (projectId: string) => void;
}) {
  const reducedMotion = useReducedMotion();
  const hasRequestedViewportCycleRef = useRef(false);
  const cycleWasRunningRef = useRef(false);
  const previousSignalStateRef = useRef<SignalState>(reducedMotion ? "stable" : "idle");
  const repoUrl = repo?.html_url || project.repoHref;
  const hasSeparateDemo = project.href !== project.repoHref;
  const signalCycle = useSignalCycle({
    reducedMotion,
    ...SIGNAL_CYCLE_TIMINGS.project,
  });
  const { state: signalState, replay, settle } = signalCycle;
  const ownsSignal = activeProjectId === project.title;

  useEffect(() => {
    if (reducedMotion) {
      cycleWasRunningRef.current = false;
      settle();
      return;
    }
    if (ownsSignal) {
      if (replay()) cycleWasRunningRef.current = true;
    } else {
      cycleWasRunningRef.current = false;
      settle();
    }
  }, [ownsSignal, reducedMotion, replay, settle]);

  useEffect(() => {
    const previousState = previousSignalStateRef.current;
    previousSignalStateRef.current = signalState;
    if (signalState === "processing" || signalState === "verified") {
      cycleWasRunningRef.current = true;
    }
    if (
      ownsSignal &&
      cycleWasRunningRef.current &&
      previousState !== "stable" &&
      signalState === "stable"
    ) {
      cycleWasRunningRef.current = false;
      onSignalSettled(project.title);
    }
  }, [onSignalSettled, ownsSignal, project.title, signalState]);

  const requestSignal = useCallback(
    (source: "viewport" | "interaction") => {
      if (reducedMotion) return;
      if (ownsSignal) {
        replay();
        return;
      }
      onSignalRequest(project.title, source);
    },
    [onSignalRequest, ownsSignal, project.title, reducedMotion, replay],
  );

  const requestViewportSignal = useCallback(() => {
    if (hasRequestedViewportCycleRef.current) return;
    hasRequestedViewportCycleRef.current = true;
    requestSignal("viewport");
  }, [requestSignal]);

  return (
    <motion.article
      className="cv-project-case"
      data-project-card={project.title}
      data-motion-state={signalState}
      data-layout={index % 2 === 0 ? "content-first" : "visual-first"}
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.16 }}
      variants={REVEAL_VARIANTS}
      transition={{ delay: index * MOTION_TOKENS.stagger }}
      onViewportEnter={requestViewportSignal}
      onMouseEnter={() => requestSignal("interaction")}
      onFocusCapture={() => requestSignal("interaction")}
    >
      <div className="cv-project-case__content">
        <header className="cv-project-case__header">
          <div>
            <span className="cv-project-case__eyebrow">{repo?.language || project.language}</span>
            <h3>{project.title}</h3>
            <p>{project.description[locale] || copy.noDescription}</p>
          </div>
          <SignalStatus
            state={signalState}
            label={signalState === "processing" ? copy.processingLabel : copy.verifiedLabel}
          />
        </header>

        <dl className="cv-project-metrics" data-project-metrics aria-label={copy.metricsLabel}>
          {project.metrics.map((metric) => (
            <div key={`${project.title}-${metric.value}-${metric.label.en}`} title={metric.source}>
              <dd>{metric.value}</dd>
              <dt>{metric.label[locale]}</dt>
            </div>
          ))}
        </dl>

        <dl className="cv-project-summary">
          <div className="cv-case-row">
            <dt>{copy.problemLabel}</dt>
            <dd>{project.problem[locale]}</dd>
          </div>
          <div className="cv-case-row">
            <dt>{copy.architectureLabel}</dt>
            <dd><Layers size={14} aria-hidden />{project.architecture[locale]}</dd>
          </div>
          <div className="cv-case-row">
            <dt>{copy.evidenceLabel}</dt>
            <dd><ListChecks size={14} aria-hidden />{project.evidence[locale]}</dd>
          </div>
        </dl>

        <div className="cv-project-case__footer">
          <div className="cv-project-stack" aria-label={copy.stackLabel}>
            {project.stack.map((item) => <span key={item} className="cv-mini-chip">{item}</span>)}
          </div>
          <div className="cv-project-actions">
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="focus-ring">
              <Github size={15} aria-hidden />
              {copy.githubCta}
              <ArrowUpRight size={13} aria-hidden />
            </a>
            {hasSeparateDemo && (
              <a href={project.href} target="_blank" rel="noopener noreferrer" className="focus-ring cv-project-actions__primary">
                {copy.liveDemoCta}
                <ArrowUpRight size={13} aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="cv-project-case__visual" data-surface-level="2">
        <span>{copy.architectureVisualLabel}</span>
        <ArchitectureDiagram architecture={project.architectureDiagram} locale={locale} state={signalState} />
      </div>
    </motion.article>
  );
}
