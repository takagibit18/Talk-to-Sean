"use client";

import { Star, GitFork, ArrowUpRight, Layers, ListChecks } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "@/components/cv/SectionHeader";
import type { GitHubRepo } from "@/lib/github";
import type { Locale } from "@/lib/locale";
import type { CVData } from "@/lib/cv-data";
import { FEATURED_PROJECTS, type FeaturedProject } from "@/lib/project-highlights";

interface RepoGridProps {
  repos: GitHubRepo[];
  locale: Locale;
  data: CVData;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#888888",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Svelte: "#ff3e00",
  Lua: "#8a9bff",
  Shell: "#89e051",
};

type ProjectCard = {
  project: FeaturedProject;
  repo: GitHubRepo | null;
};

export default function RepoGrid({ repos, locale, data }: RepoGridProps) {
  const reducedMotion = useReducedMotion();
  const t = data.projects;
  const featuredRepos: ProjectCard[] = FEATURED_PROJECTS.map((project) => {
    const repo = repos.find((candidate) =>
      project.repoAliases.includes(candidate.name.toLowerCase())
    );
    return { repo: repo || null, project };
  });

  return (
    <section id="projects" className="cv-section">
      <SectionHeader number="03" label={data.sections.projects} />

      {featuredRepos.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-muted)]">{t.emptyState}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {featuredRepos.map(({ repo, project }, index) => (
            <motion.li
              key={project.href}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.85, delay: index * 0.08, ease: [0.22, 0.68, 0.2, 1] }}
            >
              <a
                href={repo?.html_url || project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-feature-card cv-case-card focus-ring group h-full content-between"
              >
                <div>
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="cv-feature-meta">
                        {(repo?.language || project.language) && (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                LANGUAGE_COLORS[repo?.language || project.language] ||
                                "var(--color-text-muted)",
                            }}
                          />
                        )}
                        <strong className="font-medium text-[color:var(--color-text-strong)]">
                          {repo?.language || project.language}
                        </strong>
                      </span>
                      {repo?.updated_at && (
                        <span className="cv-feature-meta">{formatDate(repo.updated_at, locale, t)}</span>
                      )}
                    </div>

                    <ArrowUpRight
                      size={22}
                      className="shrink-0 text-[color:var(--color-text-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--color-accent-strong)]"
                    />
                  </div>

                  <h3 className="cv-row-title transition group-hover:text-[color:var(--color-accent-strong)]">
                    {project.title}
                  </h3>
                  <p className="cv-feature-desc">
                    {project.description[locale] || t.noDescription}
                  </p>

                  <dl className="mt-7 grid gap-4">
                    <div className="cv-case-row">
                      <dt>{t.problemLabel}</dt>
                      <dd>{project.problem[locale]}</dd>
                    </div>
                    <div className="cv-case-row">
                      <dt>{t.architectureLabel}</dt>
                      <dd className="inline-flex items-start gap-2">
                        <Layers size={14} className="mt-1 shrink-0 text-[color:var(--color-accent-strong)]" />
                        <span>{project.architecture[locale]}</span>
                      </dd>
                    </div>
                    <div className="cv-case-row">
                      <dt>{t.evidenceLabel}</dt>
                      <dd className="inline-flex items-start gap-2">
                        <ListChecks size={14} className="mt-1 shrink-0 text-[color:var(--color-accent-strong)]" />
                        <span>{project.evidence[locale]}</span>
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-2" aria-label={t.stackLabel}>
                    {project.stack.map((item) => (
                      <span key={item} className="cv-mini-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-[rgba(244,234,216,0.08)] pt-4">
                  <div className="flex items-center gap-5 text-xs text-[color:var(--color-text-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Star size={12} />
                      {formatCount(repo?.stargazers_count || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <GitFork size={12} />
                      {formatCount(repo?.forks_count || 0)}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-faint)]">
                    GitHub
                  </span>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(
  dateStr: string,
  locale: Locale,
  t: CVData["projects"]
): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const prefix = t.updated + " ";
  if (days === 0) return `${prefix}${t.today}`;
  if (days === 1) return `${prefix}${t.yesterday}`;
  if (days < 7)
    return locale === "zh"
      ? `${prefix}${days}${t.day}${t.ago}`
      : `${prefix}${days}${t.day}${t.ago}`;
  if (days < 30)
    return locale === "zh"
      ? `${prefix}${Math.floor(days / 7)}${t.week}${t.ago}`
      : `${prefix}${Math.floor(days / 7)}${t.week}${t.ago}`;
  return locale === "zh"
    ? `${prefix}${Math.floor(days / 30)}${t.month}${t.ago}`
    : `${prefix}${Math.floor(days / 30)}${t.month}${t.ago}`;
}
