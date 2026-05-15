import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";

export default function Languages({ data }: { data: CVData }) {
  return (
    <section id="languages" className="cv-section">
      <SectionHeader number="06" label={data.sections.languages} />
      <div className="grid gap-3 md:grid-cols-2">
        {data.languages.map((lang) => (
          <div
            key={lang.name}
            className="cv-language-card cv-section-panel group flex items-baseline justify-between gap-4 px-5 py-6 md:px-6"
          >
            <h3 className="cv-row-title text-2xl transition md:text-3xl">{lang.name}</h3>
            <span className="cv-language-level text-sm">{lang.level}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
