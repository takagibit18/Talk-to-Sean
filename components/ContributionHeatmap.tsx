"use client";

import { useEffect, useId, useState } from "react";
import type { ContributionDay } from "@/lib/contributions";
import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "@/components/cv/SectionHeader";
import type { Locale } from "@/lib/locale";
import type { CVData } from "@/lib/cv-data";

interface HeatmapProps {
  contributions: ContributionDay[];
  locale: Locale;
  data: CVData;
}

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
};
const DAYS: Record<Locale, string[]> = {
  en: ["Mon", "Wed", "Fri"],
  zh: ["周一", "周三", "周五"],
};
const WEEKS = 26;
const ROWS = 7;
const HOVER_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";
const LIQUID_RADIUS = 2.5;
const WEEK_GRID_WIDTH = `calc(${WEEKS} * var(--hm-cell) + ${WEEKS - 1} * var(--hm-gap))`;
const LABEL_ROW_WIDTH = `calc(var(--hm-week-grid-offset) + ${WEEKS} * var(--hm-cell) + ${WEEKS - 1} * var(--hm-gap))`;
const CELL_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 24,
  mass: 0.55,
} as const;

interface ActiveCell {
  weekIndex: number;
  dayIndex: number;
}

interface CellResponse {
  energy: number;
  offsetX: number;
  offsetY: number;
}

function getColor(count: number): string {
  if (count === 0) return "rgba(244, 234, 216, 0.085)";
  if (count <= 3) return "#5a4523";
  if (count <= 7) return "#987333";
  if (count <= 12) return "#cda04b";
  return "#eac977";
}

function getMonthLabelLeft(week: number): string {
  return `calc(var(--hm-week-grid-offset) + ${week} * (var(--hm-cell) + var(--hm-gap)))`;
}

function getCellResponse(
  activeCell: ActiveCell | null,
  weekIndex: number,
  dayIndex: number
): CellResponse {
  if (!activeCell) {
    return { energy: 0, offsetX: 0, offsetY: 0 };
  }

  const deltaX = weekIndex - activeCell.weekIndex;
  const deltaY = dayIndex - activeCell.dayIndex;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY * 0.85);
  if (distance > LIQUID_RADIUS) {
    return { energy: 0, offsetX: 0, offsetY: 0 };
  }

  const energy = Math.pow(1 - distance / LIQUID_RADIUS, 1.35);
  const offsetBase = energy * 1.35;

  return {
    energy,
    offsetX: deltaX === 0 ? 0 : Math.sign(deltaX) * offsetBase * 0.55,
    offsetY: deltaY === 0 ? 0 : Math.sign(deltaY) * offsetBase * 0.45,
  };
}

export default function ContributionHeatmap({ contributions, locale, data }: HeatmapProps) {
  const reducedMotion = useReducedMotion();
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [canUseHoverEffect, setCanUseHoverEffect] = useState(false);
  const glassFilterId = useId().replace(/:/g, "");
  const t = data.activity;

  const countMap = new Map<string, number>();
  for (const c of contributions) {
    countMap.set(c.date, c.count);
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(HOVER_QUERY);
    const updateHoverMode = () => {
      setCanUseHoverEffect(mediaQuery.matches);
    };

    updateHoverMode();
    mediaQuery.addEventListener("change", updateHoverMode);

    return () => {
      mediaQuery.removeEventListener("change", updateHoverMode);
    };
  }, []);

  const shouldAnimateHover = canUseHoverEffect && !reducedMotion;

  useEffect(() => {
    if (!shouldAnimateHover) {
      setActiveCell(null);
    }
  }, [shouldAnimateHover]);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS * 7 - 1));
  const dayOfWeek = startDate.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + daysUntilMonday);

  const weeks: Date[][] = [];
  const current = new Date(startDate);
  for (let weekIndex = 0; weekIndex < WEEKS; weekIndex++) {
    const week: Date[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  for (let weekIndex = 0; weekIndex < WEEKS; weekIndex++) {
    const firstDay = weeks[weekIndex][0];
    if (firstDay.getMonth() !== lastMonth) {
      monthLabels.push({ week: weekIndex, label: MONTHS[locale][firstDay.getMonth()] });
      lastMonth = firstDay.getMonth();
    }
  }

  const totalContributions = weeks.reduce(
    (sum, week) =>
      sum +
      week.reduce((weekSum, date) => {
        const dateStr = date.toISOString().slice(0, 10);
        return weekSum + (countMap.get(dateStr) || 0);
      }, 0),
    0
  );

  return (
    <section id="activity" className="cv-section">
      <SectionHeader number="04" label={data.sections.activity} />

      <motion.div
        className="cv-section-panel cv-heatmap-panel"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.95, ease: [0.22, 0.68, 0.2, 1] }}
      >
        <p className="cv-heading-lg mb-8">{t.total(totalContributions.toLocaleString())}</p>

        <div className="overflow-x-auto pb-1">
          <div className="relative inline-block w-max">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute h-0 w-0 overflow-hidden"
              focusable="false"
            >
              <defs>
                <filter
                  id={glassFilterId}
                  x="-80%"
                  y="-80%"
                  width="260%"
                  height="260%"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.85" result="softGlow" />
                  <feColorMatrix
                    in="softGlow"
                    type="matrix"
                    values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1.45 -0.16"
                    result="glassGlow"
                  />
                  <feBlend in="SourceGraphic" in2="glassGlow" mode="screen" result="blended" />
                  <feGaussianBlur in="blended" stdDeviation="0.28" />
                </filter>
              </defs>
            </svg>

            <div className="relative mb-1" style={{ height: "var(--hm-month-label-height)", width: LABEL_ROW_WIDTH }}>
              {monthLabels.map(({ week, label }, index) => (
                <span
                  key={index}
                  className="absolute top-0 text-[10px] leading-none text-[rgba(216,207,190,0.72)]"
                  style={{
                    left: getMonthLabelLeft(week),
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex items-start">
              <div className="mr-[var(--hm-gap)] flex w-[var(--hm-day-label-width)] flex-col gap-[var(--hm-gap)]">
                {Array.from({ length: ROWS }, (_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="text-[10px] leading-none text-[rgba(216,207,190,0.72)]"
                    style={{ height: "var(--hm-cell)" }}
                  >
                    {rowIndex < 6 && rowIndex % 2 === 0 ? DAYS[locale][rowIndex / 2] : ""}
                  </div>
                ))}
              </div>

              <div
                className="flex gap-[var(--hm-gap)]"
                style={{ width: WEEK_GRID_WIDTH }}
                onPointerLeave={shouldAnimateHover ? () => setActiveCell(null) : undefined}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[var(--hm-gap)]">
                    {week.map((date, dayIndex) => {
                      const dateStr = date.toISOString().slice(0, 10);
                      const count = countMap.get(dateStr) || 0;
                      const { energy, offsetX, offsetY } = shouldAnimateHover
                        ? getCellResponse(activeCell, weekIndex, dayIndex)
                        : { energy: 0, offsetX: 0, offsetY: 0 };
                      const highlightOpacity = energy * 0.52;
                      const blurOpacity = energy * 0.68;
                      const zIndex = energy > 0 ? 2 + Math.round(energy * 10) : 1;

                      return (
                        <motion.div
                          key={dateStr}
                          className="relative rounded-[2px] will-change-transform"
                          title={
                            locale === "zh"
                              ? `${dateStr} 有 ${count} 次贡献`
                              : `${count} contributions on ${dateStr}`
                          }
                          onPointerEnter={
                            shouldAnimateHover
                              ? () => setActiveCell({ weekIndex, dayIndex })
                              : undefined
                          }
                          animate={{
                            scale: 1 + energy * 0.18,
                            x: offsetX,
                            y: offsetY,
                            boxShadow:
                              energy > 0
                                ? `0 0 0 1px rgba(244, 234, 216, ${0.08 + energy * 0.22}), 0 ${1 + energy * 4}px ${2 + energy * 10}px rgba(234, 201, 119, ${energy * 0.22})`
                                : "0 0 0 0 rgba(0, 0, 0, 0)",
                          }}
                          transition={CELL_TRANSITION}
                          style={{
                            width: "var(--hm-cell)",
                            height: "var(--hm-cell)",
                            backgroundColor: getColor(count),
                            zIndex,
                          }}
                        >
                          <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-[inherit]"
                            animate={{
                              opacity: energy * 0.18,
                            }}
                            transition={CELL_TRANSITION}
                            style={{
                              background:
                                "linear-gradient(180deg, var(--hm-liquid-edge) 0%, rgba(255,255,255,0) 70%)",
                            }}
                          />

                          <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-[inherit]"
                            animate={{
                              opacity: blurOpacity,
                              scale: 1 + energy * 0.12,
                              x: -offsetX * 0.7,
                              y: -offsetY * 0.7,
                            }}
                            transition={CELL_TRANSITION}
                            style={{
                              background:
                                "radial-gradient(circle at 30% 30%, var(--hm-liquid-highlight) 0%, var(--hm-liquid-glow) 38%, rgba(255,255,255,0) 74%)",
                              filter: `url(#${glassFilterId})`,
                            }}
                          />

                          <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen"
                            animate={{
                              opacity: highlightOpacity,
                              x: -offsetX * 1.15,
                              y: -offsetY * 1.15,
                              scale: 1 + energy * 0.06,
                            }}
                            transition={CELL_TRANSITION}
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.64) 0%, rgba(255,255,255,0.14) 44%, rgba(255,255,255,0) 76%)",
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-[rgba(216,207,190,0.72)]">
              <span>{t.less}</span>
              {[0, 1, 4, 8, 13].map((value) => (
                <div
                  key={value}
                  className="rounded-[2px]"
                  style={{
                    width: "calc(var(--hm-cell) - 1px)",
                    height: "calc(var(--hm-cell) - 1px)",
                    backgroundColor: getColor(value),
                  }}
                />
              ))}
              <span>{t.more}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
