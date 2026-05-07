import { ArrowUpRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import type { CVData } from "@/lib/cv-data";

export default function Publications({ data }: { data: CVData }) {
  return (
    <section id="publications" className="cv-section">
      <SectionHeader number="07" label={data.sections.publications} />
      <ul className="flex flex-col">
        {data.publications.map((p, i) => {
          const inner = (
            <>
              <div className="flex-1">
                <h3 className="cv-row-title">{p.title}</h3>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                  {p.org} · {p.year}
                </p>
              </div>
              {p.href && (
                <ArrowUpRight
                  size={22}
                  className="shrink-0 text-[color:var(--color-text-muted)] transition group-hover:text-[color:var(--color-accent-strong)]"
                />
              )}
            </>
          );
          const baseClass =
            "flex items-center gap-4 py-6 border-t border-[color:var(--color-border)] first:border-t-0";
          return (
            <li key={i}>
              {p.href ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`focus-ring group ${baseClass}`}
                >
                  {inner}
                </a>
              ) : (
                <div className={baseClass}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
