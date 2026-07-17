"use client";

import { useCallback, useRef, useState } from "react";
import SectionHeader from "@/components/cv/SectionHeader";
import ProjectCard from "@/components/cv/ProjectCard";
import type { GitHubRepo } from "@/lib/github";
import type { Locale } from "@/lib/locale";
import type { CVData } from "@/lib/cv-data";
import { FEATURED_PROJECTS } from "@/lib/project-highlights";
import { getHomeSectionNumber } from "@/lib/home-sections";

interface RepoGridProps {
  repos: GitHubRepo[];
  locale: Locale;
  data: CVData;
}

export default function RepoGrid({ repos, locale, data }: RepoGridProps) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const activeProjectIdRef = useRef<string | null>(null);
  const viewportQueueRef = useRef<string[]>([]);
  const featuredRepos = FEATURED_PROJECTS.map((project) => ({
    project,
    repo:
      repos.find((candidate) => project.repoAliases.includes(candidate.name.toLowerCase())) || null,
  }));

  const commitActiveProject = useCallback((projectId: string | null) => {
    activeProjectIdRef.current = projectId;
    setActiveProjectId(projectId);
  }, []);

  const requestProjectSignal = useCallback(
    (projectId: string, source: "viewport" | "interaction") => {
      if (activeProjectIdRef.current === projectId) return;

      if (source === "viewport" && activeProjectIdRef.current !== null) {
        if (!viewportQueueRef.current.includes(projectId)) {
          viewportQueueRef.current.push(projectId);
        }
        return;
      }

      viewportQueueRef.current = viewportQueueRef.current.filter((id) => id !== projectId);
      commitActiveProject(projectId);
    },
    [commitActiveProject],
  );

  const settleProjectSignal = useCallback(
    (projectId: string) => {
      if (activeProjectIdRef.current !== projectId) return;
      const nextProject = viewportQueueRef.current.shift() ?? null;
      commitActiveProject(nextProject);
    },
    [commitActiveProject],
  );

  return (
    <section id="projects" className="cv-section cv-projects-section">
      <SectionHeader number={getHomeSectionNumber("projects")} label={data.sections.projects} />
      <div className="cv-project-grid">
        {featuredRepos.map(({ repo, project }, index) => (
          <ProjectCard
            key={project.title}
            project={project}
            repo={repo}
            locale={locale}
            copy={data.projects}
            index={index}
            activeProjectId={activeProjectId}
            onSignalRequest={requestProjectSignal}
            onSignalSettled={settleProjectSignal}
          />
        ))}
      </div>
    </section>
  );
}
