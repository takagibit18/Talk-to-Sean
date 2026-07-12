"use client";

import { useEffect, useMemo, useState } from "react";
import type { CVData } from "@/lib/cv-data";
import type { Locale } from "@/lib/locale";
import type { GitHubUser } from "@/lib/github";
import { getHomeSectionItems } from "@/lib/home-sections";
import AnimatedThemeToggler from "@/components/theme/AnimatedThemeToggler";

interface TopBarProps {
  user: GitHubUser | null;
  data: CVData;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

const PRIMARY_NAV_IDS = new Set(["projects", "skills", "activity", "about", "contact"]);

export default function TopBar({ user, data, locale, onLocaleChange }: TopBarProps) {
  const displayName = user?.name || user?.login || data.footer.author;
  const items = useMemo(() => getHomeSectionItems(data), [data]);
  const primaryItems = useMemo(
    () => items.filter((item) => PRIMARY_NAV_IDS.has(item.id)),
    [items],
  );
  const [activeId, setActiveId] = useState(items[0]?.id ?? "projects");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const probe = window.scrollY + window.innerHeight * 0.3;
      let next = items[0]?.id ?? "projects";
      items.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top + window.scrollY <= probe) {
          next = item.id;
        }
      });
      setActiveId(next);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [items]);

  return (
    <header className="cv-topbar">
      <div className="cv-container cv-topbar__inner">
        <a href="#main-content" className="cv-topbar__identity focus-ring">
          <span className="cv-status-dot" aria-hidden />
          <span>{displayName}</span>
        </a>

        <nav className="cv-topbar__nav" aria-label={data.nav.sectionsLabel}>
          {primaryItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="focus-ring"
              aria-current={activeId === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="cv-topbar__controls">
          <AnimatedThemeToggler
            lightLabel={data.nav.switchToLightTheme}
            darkLabel={data.nav.switchToDarkTheme}
          />
          <div className="cv-locale-switch" aria-label="Language">
            {(["en", "zh"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onLocaleChange(option)}
                aria-pressed={locale === option}
                className="focus-ring"
              >
                {option === "en" ? "EN" : "中"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
