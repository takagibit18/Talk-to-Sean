"use client";

import { useMemo, useState } from "react";
import RepoGrid from "@/components/RepoGrid";
import ContributionHeatmap from "@/components/ContributionHeatmap";
import TopBar from "@/components/cv/TopBar";
import Hero from "@/components/cv/Hero";
import About from "@/components/cv/About";
import Skills from "@/components/cv/Skills";
import Education from "@/components/cv/Education";
import Languages from "@/components/cv/Languages";
import Contact from "@/components/cv/Contact";
import Footer from "@/components/cv/Footer";
import type { GitHubRepo, GitHubUser } from "@/lib/github";
import type { ContributionDay } from "@/lib/contributions";
import type { Locale } from "@/lib/locale";
import { CV_DATA } from "@/lib/cv-data";

interface HomeContentProps {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  contributions: ContributionDay[];
}

export default function HomeContent({
  user,
  repos,
  contributions
}: HomeContentProps) {
  const [locale, setLocale] = useState<Locale>("en");
  const data = useMemo(() => CV_DATA[locale], [locale]);

  return (
    <>
      <TopBar user={user} data={data} locale={locale} onLocaleChange={setLocale} />

      <div className="page-grain" aria-hidden />

      <main className="cv-container relative">
        <Hero data={data} />
        <About data={data} />
        <Skills data={data} />
        <RepoGrid repos={repos} locale={locale} data={data} />
        <ContributionHeatmap contributions={contributions} locale={locale} data={data} />
        <Education data={data} />
        <Languages data={data} />
        <Contact data={data} />
        <Footer data={data} user={user} />
      </main>
    </>
  );
}
