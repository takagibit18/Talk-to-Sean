"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, GitBranch, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CVData } from "@/lib/cv-data";

interface HeroProps {
  data: CVData;
}

export default function Hero({ data }: HeroProps) {
  const reducedMotion = useReducedMotion();
  const EASE = [0.22, 0.68, 0.2, 1] as const;
  const avatarSrc = "/avatar-warm-portrait.png";

  const fadeUp = (delay: number) =>
    reducedMotion
      ? { initial: false as const, animate: {} }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="flex flex-col gap-8 md:gap-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.82fr)] md:items-start md:gap-16">
          <div className="flex flex-col gap-5 md:gap-6">
            <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-3">
              <span className="cv-badge">{data.hero.yearsBadge}</span>
              <span className="cv-badge cv-badge--accent">{data.hero.intent}</span>
            </motion.div>

            <div className="flex flex-col gap-3">
              <motion.h1
                {...fadeUp(0.05)}
                className="cv-hero-name"
                aria-label={data.hero.name}
              >
                {data.hero.name}
              </motion.h1>

              <motion.span
                {...fadeUp(0.15)}
                className="text-xs md:text-sm uppercase tracking-[0.35em] text-[color:var(--color-text-muted)]"
              >
                {data.hero.nameLatin}
              </motion.span>

              <motion.p
                {...fadeUp(0.25)}
                className="cv-heading-sm mt-2 max-w-3xl text-[color:var(--color-text-strong)]"
              >
                {data.hero.role}{" "}
                <span className="text-[color:var(--color-text-muted)]">
                  {data.hero.location}
                </span>
              </motion.p>
            </div>

            <motion.div {...fadeUp(0.32)} className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#projects" className="cv-cta cv-cta-primary focus-ring text-sm">
                {data.nav.exploreProjects}
                <ArrowDown size={14} />
              </a>
              <Link href="/chat" className="cv-cta cv-cta--cool focus-ring text-sm">
                <MessageCircle size={15} />
                {data.hero.talkToSean}
                <ArrowUpRight size={13} />
              </Link>
              <a href="/cv.pdf" className="cv-cta cv-cta--ghost focus-ring text-sm">
                {data.nav.downloadCv}
              </a>
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(0.35)}
            className="cv-hero-card"
          >
            <div className="flex items-center gap-4">
              <div className="cv-avatar-shell">
                <div className="cv-avatar-frame">
                  <div className="cv-avatar-surface">
                    <Image
                      src={avatarSrc}
                      alt={`${data.hero.name} portrait`}
                      fill
                      priority
                      sizes="(min-width: 768px) 224px, 160px"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                  {data.hero.nameLatin}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--color-text-strong)]">
                  <span className="cv-status-dot" aria-hidden />
                  <span className="truncate">{data.hero.intent}</span>
                </div>
              </div>
            </div>

            <blockquote className="cv-quote">
              &ldquo; {data.hero.quote} &rdquo;
            </blockquote>

            <div className="cv-agent-lab" aria-label={data.hero.labTitle}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
                    {data.hero.labTitle}
                  </div>
                  <div className="mt-1 text-sm text-[color:var(--color-text)]">
                    {data.hero.labSubtitle}
                  </div>
                </div>
                <GitBranch size={18} className="shrink-0 text-[color:var(--color-accent-strong)]" />
              </div>

              <div className="mt-5 grid gap-3">
                {data.hero.proofPoints.map((item) => (
                  <div key={item.label} className="cv-agent-step">
                    <span className="cv-agent-step-label">{item.label}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[color:var(--color-text-strong)]">
                        {item.value}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-[color:var(--color-text-muted)]">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...fadeUp(0.55)}
          className="cv-scroll-cue mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em]"
        >
          <ArrowDown size={14} />
          <span>{data.nav.scroll}</span>
        </motion.div>
      </div>
    </section>
  );
}
