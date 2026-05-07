"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { CVData } from "@/lib/cv-data";
import type { GitHubUser } from "@/lib/github";

interface FooterProps {
  data: CVData;
  user: GitHubUser | null;
}

export default function Footer({ data, user }: FooterProps) {
  const reducedMotion = useReducedMotion();
  const displayName = user?.name || user?.login || data.footer.author;
  const contactHref = user?.email
    ? `mailto:${user.email}`
    : data.contact.email
      ? `mailto:${data.contact.email}`
      : "#contact";

  return (
    <footer className="cv-footer-lockup border-t border-[color:var(--color-border)]">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 1.05, ease: [0.22, 0.68, 0.2, 1] }}
      >
        <h2 className="cv-heading-xl mb-10 max-w-[14ch] text-[clamp(1.9rem,6.8vw,4.6rem)] md:mb-12 md:max-w-none">
          {data.footer.tagline}
        </h2>

        <div className="cv-section-panel grid gap-8 p-5 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-12 md:p-6">
          <div className="flex items-center gap-4">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={displayName}
                width={56}
                height={56}
                className="rounded-full border border-[color:var(--color-border-strong)]"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border-strong)]" />
            )}
            <div>
              <div className="text-base text-[color:var(--color-text-strong)]">{displayName}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                <span className="cv-status-dot" aria-hidden />
                <span>{data.nav.availability}</span>
              </div>
            </div>
          </div>

          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)] md:text-center">
            {data.nav.timezone}
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="/cv.pdf" className="cv-cta">
              {data.nav.downloadCv}
            </a>
            <a href={contactHref} className="cv-cta cv-cta-primary">
              {data.nav.contactMe}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-[color:var(--color-text-muted)]">
          <span>
            © {new Date().getFullYear()} {displayName}
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=32081202000685"
              rel="noreferrer"
              target="_blank"
              className="inline-flex items-center gap-1.5 transition hover:text-[color:var(--color-text-strong)]"
            >
              <Image
                src="/beian-icon.png"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4"
                aria-hidden
              />
              <span>苏公网安备32081202000685号</span>
            </a>
            <a
              href={data.footer.madeByHref}
              className="transition hover:text-[color:var(--color-text-strong)]"
            >
              {data.footer.madeBy}
            </a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
