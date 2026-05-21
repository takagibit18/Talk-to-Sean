"use client";

import MergeWardenFlow from "@/components/motion/MergeWardenFlow";
import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";
import type { Locale } from "@/lib/locale";

export default function Publications({ data, locale }: { data: CVData; locale: Locale }) {
  return (
    <section id="publications" className="cv-section">
      <SectionHeader number="07" label={data.sections.publications} />
      <MergeWardenFlow locale={locale} />
    </section>
  );
}
