"use client";

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
  const featuredRepos = FEATURED_PROJECTS.map((project) => ({
    project,
    repo:
      repos.find((candidate) => project.repoAliases.includes(candidate.name.toLowerCase())) || null,
  }));

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
          />
        ))}
      </div>
    </section>
  );
}
