"use client";

import type { CVData } from "@/lib/cv-data";
import type { Locale } from "@/lib/locale";
import type { GitHubUser } from "@/lib/github";
import AnimatedThemeToggler from "@/components/theme/AnimatedThemeToggler";

interface TopBarProps {
  user: GitHubUser | null;
  data: CVData;
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
}

export default function TopBar({ user, data, locale, onLocaleChange }: TopBarProps) {
  const displayName = user?.name || user?.login || data.footer.author;

  return (
    <div className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-topbar-bg)] backdrop-blur">
      <div className="cv-container flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="cv-status-dot shrink-0" aria-hidden />
          <span className="min-w-0 truncate text-xs text-[color:var(--color-text-strong)] md:text-sm">
            {displayName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <AnimatedThemeToggler />

          <div className="mr-0 flex shrink-0 items-center gap-0.5 rounded-full border border-[color:var(--color-border)] p-0.5 text-[0.625rem] sm:mr-1 sm:gap-1 sm:text-xs">
            <button
              type="button"
              onClick={() => onLocaleChange("en")}
              aria-pressed={locale === "en"}
              className={`focus-ring w-[2.35rem] shrink-0 rounded-full px-1.5 py-0.5 text-center transition sm:w-[2.75rem] sm:px-2 sm:py-1 ${
                locale === "en"
                  ? "bg-[color:var(--color-text-strong)] text-[color:var(--color-bg)]"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-strong)]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("zh")}
              aria-pressed={locale === "zh"}
              className={`focus-ring w-[2.35rem] shrink-0 rounded-full px-1.5 py-0.5 text-center transition sm:w-[2.75rem] sm:px-2 sm:py-1 ${
                locale === "zh"
                  ? "bg-[color:var(--color-text-strong)] text-[color:var(--color-bg)]"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-strong)]"
              }`}
            >
              中
            </button>
          </div>

          <a
            href="#contact"
            className="cv-cta inline-flex max-w-[9rem] shrink-0 truncate px-2 py-1.5 text-[0.7rem] sm:max-w-none sm:overflow-visible sm:whitespace-normal sm:px-3 sm:py-2 sm:text-xs"
          >
            {data.nav.contactMe}
          </a>
        </div>
      </div>
    </div>
  );
}
