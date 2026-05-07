import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";

export default function Skills({ data }: { data: CVData }) {
  return (
    <section id="skills" className="cv-section">
      <SectionHeader number="02" label={data.sections.skills} />
      <div className="flex flex-col">
        {data.skills.map((group) => (
          <div key={group.group} className="cv-skill-cluster">
            <div>
              <strong className="cv-skill-heading">{group.group}</strong>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {group.items.map((item) => (
                <span key={item} className="cv-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
