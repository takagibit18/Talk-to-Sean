"use client";

import { useState } from "react";
import { ArrowUpRight, Github, Layers, ListChecks } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArchitectureDiagram, SignalStatus } from "@/components/motion/SignalSystem";
import { MOTION_TOKENS, REVEAL_VARIANTS } from "@/lib/motion-system";
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
}: {
  project: FeaturedProject;
  repo: GitHubRepo | null;
  locale: Locale;
  copy: CVData["projects"];
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const repoUrl = repo?.html_url || project.repoHref;
  const hasSeparateDemo = project.href !== project.repoHref;

  return (
    <motion.article
      className="cv-project-card"
      data-project-card={project.title}
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.16 }}
      variants={REVEAL_VARIANTS}
      transition={{ delay: index * MOTION_TOKENS.stagger }}
      onViewportEnter={() => !reducedMotion && setActive(true)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(false);
      }}
    >
      <header className="cv-project-card__header">
        <div>
          <span className="cv-project-card__eyebrow">{repo?.language || project.language}</span>
          <h3>{project.title}</h3>
          <p>{project.description[locale] || copy.noDescription}</p>
        </div>
        <SignalStatus
          state={active ? "processing" : "stable"}
          label={active ? copy.processingLabel : copy.verifiedLabel}
        />
      </header>

      <div className="cv-project-card__visual">
        <span>{copy.architectureVisualLabel}</span>
        <ArchitectureDiagram architecture={project.architectureDiagram} locale={locale} active={active} />
      </div>

      <dl className="cv-project-metrics" data-project-metrics aria-label={copy.metricsLabel}>
        {project.metrics.map((metric) => (
          <div key={`${project.title}-${metric.value}-${metric.label.en}`} title={metric.source}>
            <dt>{metric.label[locale]}</dt>
            <dd>{metric.value}</dd>
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

      <div className="cv-project-card__footer">
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
    </motion.article>
  );
}
