"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import RepoGrid from "@/components/RepoGrid";
import ContributionHeatmap from "@/components/ContributionHeatmap";
import TopBar from "@/components/cv/TopBar";
import Hero from "@/components/cv/Hero";
import About from "@/components/cv/About";
import Skills from "@/components/cv/Skills";
import Education from "@/components/cv/Education";
import Languages from "@/components/cv/Languages";
import Publications from "@/components/cv/Publications";
import Contact from "@/components/cv/Contact";
import Footer from "@/components/cv/Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";
import SectionReveal from "@/components/motion/SectionReveal";
import SectionTelemetry from "@/components/motion/SectionTelemetry";
import type { GitHubRepo, GitHubUser } from "@/lib/github";
import type { ContributionDay } from "@/lib/contributions";
import type { Locale } from "@/lib/locale";
import { CV_DATA } from "@/lib/cv-data";
import { getHomeSectionItems } from "@/lib/home-sections";

interface HomeContentProps {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  contributions: ContributionDay[];
  talkToSeanUrl: string | null;
  initialLocale: Locale;
}

export default function HomeContent({
  user,
  repos,
  contributions,
  talkToSeanUrl,
  initialLocale,
}: HomeContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const data = useMemo(() => CV_DATA[locale], [locale]);
  const telemetrySections = useMemo(() => getHomeSectionItems(data), [data]);
  const handleLocaleChange = (nextLocale: Locale) => {
    setLocale(nextLocale);
    document.cookie = `lang=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.replace(nextLocale === "en" ? pathname : `${pathname}?lang=${nextLocale}`, {
      scroll: false,
    });
  };

  return (
    <div className="home-shell">
      <ScrollProgress />
      <TopBar user={user} data={data} locale={locale} onLocaleChange={handleLocaleChange} />

      <div className="page-grain" aria-hidden />
      <SectionTelemetry items={telemetrySections} label={data.nav.sectionsLabel} />

      <main id="main-content" className="cv-container relative">
        <Hero data={data} talkToSeanUrl={talkToSeanUrl} />
        <RepoGrid repos={repos} locale={locale} data={data} />
        <Skills data={data} />
        <ContributionHeatmap contributions={contributions} locale={locale} data={data} />
        <SectionReveal>
          <About data={data} />
        </SectionReveal>
        <SectionReveal>
          <Education data={data} />
        </SectionReveal>
        <SectionReveal>
          <Languages data={data} />
        </SectionReveal>
        <SectionReveal>
          <Publications data={data} locale={locale} />
        </SectionReveal>
        <SectionReveal>
          <Contact data={data} talkToSeanUrl={talkToSeanUrl} />
        </SectionReveal>
        <Footer data={data} user={user} />
      </main>
    </div>
  );
}
