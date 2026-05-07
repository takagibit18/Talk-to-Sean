import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";

export default function About({ data }: { data: CVData }) {
  return (
    <section id="about" className="cv-section">
      <SectionHeader number="01" label={data.sections.about} />
      <div className="cv-row" style={{ borderTop: "none", paddingTop: 0 }}>
        <div className="cv-row-meta">
          <strong>{data.about.meta}</strong>
        </div>
        <p className="cv-row-desc max-w-[62ch] text-base md:text-lg">{data.about.body}</p>
      </div>
    </section>
  );
}
