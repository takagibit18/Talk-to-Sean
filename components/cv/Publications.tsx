"use client";

import MergeWardenFlow from "@/components/motion/MergeWardenFlow";
import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";
import { getHomeSectionNumber } from "@/lib/home-sections";
import type { Locale } from "@/lib/locale";

export default function Publications({ data, locale }: { data: CVData; locale: Locale }) {
  return (
    <section id="publications" className="cv-section">
      <SectionHeader number={getHomeSectionNumber("publications")} label={data.sections.publications} />
      <MergeWardenFlow locale={locale} />
    </section>
  );
}
