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
            className="cv-section-panel flex items-baseline justify-between gap-4 px-5 py-6 transition hover:border-[rgba(225,189,104,0.28)] md:px-6"
          >
            <h3 className="cv-row-title text-2xl md:text-3xl">{lang.name}</h3>
            <span className="text-sm text-[rgba(216,207,190,0.72)]">{lang.level}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
