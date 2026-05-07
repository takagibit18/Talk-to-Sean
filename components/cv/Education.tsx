import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";

export default function Education({ data }: { data: CVData }) {
  return (
    <section id="education" className="cv-section">
      <SectionHeader number="05" label={data.sections.education} />
      <div className="cv-section-panel">
        {data.education.map((edu, i) => (
          <article key={i} className="grid gap-5 p-5 md:grid-cols-[260px_1fr] md:gap-10 md:p-7">
            <div>
              <strong className="block text-sm font-semibold text-[color:var(--color-text-strong)]">
                {edu.school}
              </strong>
              <span className="mt-2 block text-sm text-[color:var(--color-text-muted)]">
                {edu.period}
              </span>
            </div>
            <div>
              <h3 className="cv-row-title">{edu.title}</h3>
              <p className="cv-row-desc">{edu.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
