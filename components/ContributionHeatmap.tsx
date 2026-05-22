"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ContributionDay } from "@/lib/contributions";
import { motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import SectionHeader from "@/components/cv/SectionHeader";
import { useCursorSpotlight } from "@/components/motion/useCursorSpotlight";
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
const LIQUID_RADIUS = 2.15;
const LIQUID_FAST_RADIUS = 3.85;
const POINTER_SPEED_THRESHOLD = 0.06;
const POINTER_FAST_SPEED = 0.88;
const POINTER_HISTORY_SIZE = 5;
const WEEK_GRID_WIDTH = `calc(${WEEKS} * var(--hm-cell) + ${WEEKS - 1} * var(--hm-gap))`;
const LABEL_ROW_WIDTH = `calc(var(--hm-week-grid-offset) + ${WEEKS} * var(--hm-cell) + ${WEEKS - 1} * var(--hm-gap))`;
const CELL_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.42,
} as const;
const CELL_ENTER_DURATION = 0.075;
const CELL_ENTER_MAX_DELAY = 0.46;
const COUNTER_DURATION_MS = 1050;

interface ActiveCell {
  weekIndex: number;
  dayIndex: number;
}

interface CellResponse {
  energy: number;
  offsetX: number;
  offsetY: number;
}

interface PointerSample {
  weekIndex: number;
  dayIndex: number;
  time: number;
}

export interface PointerTrend {
  directionX: number;
  directionY: number;
  speed: number;
  radius: number;
  hasMotion: boolean;
}

const REST_POINTER_TREND: PointerTrend = {
  directionX: 0,
  directionY: 0,
  speed: 0,
  radius: LIQUID_RADIUS,
  hasMotion: false,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getColor(count: number): string {
  if (count === 0) return "var(--hm-level-0)";
  if (count <= 3) return "var(--hm-level-1)";
  if (count <= 7) return "var(--hm-level-2)";
  if (count <= 12) return "var(--hm-level-3)";
  return "var(--hm-level-4)";
}

function getMonthLabelLeft(week: number): string {
  return `calc(var(--hm-week-grid-offset) + ${week} * (var(--hm-cell) + var(--hm-gap)))`;
}

function getCellRevealDelay(weekIndex: number, dayIndex: number): number {
  return Math.min(weekIndex * 0.015 + dayIndex * 0.008, CELL_ENTER_MAX_DELAY);
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function getCellResponse(
  activeCell: ActiveCell | null,
  weekIndex: number,
  dayIndex: number,
  pointerTrend: PointerTrend = REST_POINTER_TREND,
): CellResponse {
  if (!activeCell) {
    return { energy: 0, offsetX: 0, offsetY: 0 };
  }

  const deltaX = weekIndex - activeCell.weekIndex;
  const deltaY = dayIndex - activeCell.dayIndex;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY * 0.9);
  const radius = clamp(pointerTrend.radius, LIQUID_RADIUS, LIQUID_FAST_RADIUS);
  if (distance > radius) {
    return { energy: 0, offsetX: 0, offsetY: 0 };
  }

  const motionEnergy = pointerTrend.hasMotion
    ? clamp(pointerTrend.speed / POINTER_FAST_SPEED, 0, 1)
    : 0;
  const radialEnergy = Math.pow(1 - distance / radius, 1.55);
  if (!pointerTrend.hasMotion || distance === 0) {
    const offsetBase = radialEnergy * 1.05;

    return {
      energy: radialEnergy,
      offsetX: deltaX === 0 ? 0 : Math.sign(deltaX) * offsetBase * 0.46,
      offsetY: deltaY === 0 ? 0 : Math.sign(deltaY) * offsetBase * 0.38,
    };
  }

  const directionX = pointerTrend.directionX;
  const directionY = pointerTrend.directionY;
  const distanceSafe = Math.max(distance, 0.001);
  const lateralFactor = Math.abs(deltaX * directionY - deltaY * directionX) / distanceSafe;
  const forwardProjection = deltaX * directionX + deltaY * directionY;
  const sideProjection = deltaX * -directionY + deltaY * directionX;
  const lateralSign = sideProjection === 0 ? Math.sign(deltaY || deltaX || 1) : Math.sign(sideProjection);
  const sideX = -directionY * lateralSign;
  const sideY = directionX * lateralSign;
  const forwardCompression = clamp(forwardProjection / radius, -1, 1);
  const directionalEnergy = radialEnergy * (0.74 + lateralFactor * 0.52 + Math.max(0, forwardCompression) * 0.16);
  const offsetBase = directionalEnergy * (1.08 + motionEnergy * 1.28);
  const wake = forwardCompression < 0 ? -0.12 * motionEnergy * radialEnergy : 0.16 * motionEnergy * radialEnergy;

  return {
    energy: clamp(directionalEnergy, 0, 1),
    offsetX: sideX * offsetBase + directionX * wake,
    offsetY: sideY * offsetBase + directionY * wake,
  };
}

export default function ContributionHeatmap({ contributions, locale, data }: HeatmapProps) {
  const reducedMotion = useReducedMotion();
  const [trailCell, setTrailCell] = useState<ActiveCell | null>(null);
  const [pointerTrend, setPointerTrend] = useState<PointerTrend>(REST_POINTER_TREND);
  const [canUseHoverEffect, setCanUseHoverEffect] = useState(false);
  const [hasEnteredPanel, setHasEnteredPanel] = useState(false);
  const [isGridHovered, setIsGridHovered] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(0);
  const { hostRef, spotlightRef } = useCursorSpotlight<HTMLElement>();
  const heatmapGridRef = useRef<HTMLDivElement>(null);
  const pointerSamplesRef = useRef<PointerSample[]>([]);
  const trailTargetRef = useRef<ActiveCell | null>(null);
  const trailCellRef = useRef<ActiveCell | null>(null);
  const trailFrameRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);
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
      trailCellRef.current = null;
      trailTargetRef.current = null;
      pointerSamplesRef.current = [];
      setTrailCell(null);
      setPointerTrend(REST_POINTER_TREND);
    }
  }, [shouldAnimateHover]);

  const updateTrailCell = useCallback(() => {
    const target = trailTargetRef.current;
    if (!target) {
      trailFrameRef.current = null;
      return;
    }

    const current = trailCellRef.current ?? target;
    const next = {
      weekIndex: current.weekIndex + (target.weekIndex - current.weekIndex) * 0.34,
      dayIndex: current.dayIndex + (target.dayIndex - current.dayIndex) * 0.34,
    };
    const distanceToTarget = Math.hypot(
      target.weekIndex - next.weekIndex,
      target.dayIndex - next.dayIndex,
    );
    const settled = distanceToTarget < 0.018;
    const nextTrail = settled ? target : next;

    trailCellRef.current = nextTrail;
    setTrailCell(nextTrail);
    trailFrameRef.current = settled ? null : window.requestAnimationFrame(updateTrailCell);
  }, []);

  const requestTrailUpdate = useCallback(() => {
    if (trailFrameRef.current === null) {
      trailFrameRef.current = window.requestAnimationFrame(updateTrailCell);
    }
  }, [updateTrailCell]);

  const setTrailTarget = useCallback(
    (point: ActiveCell) => {
      if (leaveTimerRef.current !== null) {
        window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }

      trailTargetRef.current = point;
      if (!trailCellRef.current) {
        trailCellRef.current = point;
        setTrailCell(point);
        return;
      }

      requestTrailUpdate();
    },
    [requestTrailUpdate],
  );

  const getPointerGridPoint = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const grid = heatmapGridRef.current;
    if (!grid) return null;

    const rect = grid.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    return {
      weekIndex: clamp(((event.clientX - rect.left) / rect.width) * (WEEKS - 1), 0, WEEKS - 1),
      dayIndex: clamp(((event.clientY - rect.top) / rect.height) * (ROWS - 1), 0, ROWS - 1),
    };
  }, []);

  const handleGridPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!shouldAnimateHover) return;

      const point = getPointerGridPoint(event);
      if (!point) return;

      if (leaveTimerRef.current !== null) {
        window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }

      const now = performance.now();
      pointerSamplesRef.current = [
        ...pointerSamplesRef.current,
        { ...point, time: now },
      ].slice(-POINTER_HISTORY_SIZE);

      const firstSample = pointerSamplesRef.current[0];
      const elapsed = Math.max(now - firstSample.time, 1);
      const deltaX = point.weekIndex - firstSample.weekIndex;
      const deltaY = point.dayIndex - firstSample.dayIndex;
      const distance = Math.hypot(deltaX, deltaY);
      const speed = (distance / elapsed) * 16.67;
      const speedEnergy = clamp(speed / POINTER_FAST_SPEED, 0, 1);

      if (speed > POINTER_SPEED_THRESHOLD && distance > 0.001) {
        setPointerTrend({
          directionX: deltaX / distance,
          directionY: deltaY / distance,
          speed,
          radius: LIQUID_RADIUS + (LIQUID_FAST_RADIUS - LIQUID_RADIUS) * speedEnergy,
          hasMotion: true,
        });
      } else {
        setPointerTrend(REST_POINTER_TREND);
      }

      setTrailTarget(point);
    },
    [getPointerGridPoint, setTrailTarget, shouldAnimateHover],
  );

  const handleCellPointerEnter = useCallback(
    (weekIndex: number, dayIndex: number) => {
      if (!shouldAnimateHover) return;

      setTrailTarget({ weekIndex, dayIndex });
    },
    [setTrailTarget, shouldAnimateHover],
  );

  const handleGridPointerLeave = useCallback(() => {
    setIsGridHovered(false);
    pointerSamplesRef.current = [];
    trailTargetRef.current = null;
    setPointerTrend(REST_POINTER_TREND);

    if (trailFrameRef.current !== null) {
      window.cancelAnimationFrame(trailFrameRef.current);
      trailFrameRef.current = null;
    }

    if (leaveTimerRef.current !== null) {
      window.clearTimeout(leaveTimerRef.current);
    }

    leaveTimerRef.current = window.setTimeout(() => {
      trailCellRef.current = null;
      setTrailCell(null);
      leaveTimerRef.current = null;
    }, 380);
  }, []);

  useEffect(() => {
    return () => {
      if (trailFrameRef.current !== null) {
        window.cancelAnimationFrame(trailFrameRef.current);
      }
      if (leaveTimerRef.current !== null) {
        window.clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const contributionsSorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date();
  const dataLatestDate = contributionsSorted.length > 0
    ? new Date(contributionsSorted[contributionsSorted.length - 1].date + "T12:00:00Z")
    : today;
  const latestDate = dataLatestDate > today ? today : dataLatestDate;
  const startDate = new Date(latestDate);
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
  const animatedTotal = reducedMotion || !hasEnteredPanel ? totalContributions : displayTotal;

  useEffect(() => {
    if (reducedMotion || !hasEnteredPanel) {
      setDisplayTotal(totalContributions);
      setIsRevealing(false);
      return undefined;
    }

    setIsRevealing(true);

    const startedAt = performance.now();
    const revealTimer = window.setTimeout(() => {
      setIsRevealing(false);
    }, (CELL_ENTER_MAX_DELAY + CELL_ENTER_DURATION) * 1000 + 90);
    let animationFrame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / COUNTER_DURATION_MS, 1);
      setDisplayTotal(Math.round(totalContributions * easeOutCubic(progress)));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(revealTimer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [hasEnteredPanel, reducedMotion, totalContributions]);

  return (
    <section id="activity" ref={hostRef} className="cv-section cursor-spotlight-host overflow-hidden">
      <div ref={spotlightRef} className="cursor-spotlight" aria-hidden />
      <SectionHeader number="04" label={data.sections.activity} />

      <motion.div
        className="cv-section-panel cv-heatmap-panel"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        onViewportEnter={() => setHasEnteredPanel(true)}
        transition={{ duration: 0.95, ease: [0.22, 0.68, 0.2, 1] }}
      >
        <p className="cv-heading-lg mb-8" suppressHydrationWarning>
          {t.total(animatedTotal.toLocaleString())}
        </p>

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
                  className="hm-label absolute top-0 text-[10px] leading-none"
                  style={{
                    left: getMonthLabelLeft(week),
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="relative flex items-start overflow-hidden"
              onPointerEnter={() => setIsGridHovered(true)}
              onPointerLeave={handleGridPointerLeave}
            >
              {!reducedMotion && (
                <div
                  aria-hidden="true"
                  className="heatmap-shimmer"
                  style={{
                    left: "var(--hm-week-grid-offset)",
                    width: WEEK_GRID_WIDTH,
                    animationPlayState: isGridHovered ? "paused" : "running",
                  }}
                />
              )}

              <div className="mr-[var(--hm-gap)] flex w-[var(--hm-day-label-width)] flex-col gap-[var(--hm-gap)]">
                {Array.from({ length: ROWS }, (_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="hm-label text-[10px] leading-none"
                    style={{ height: "var(--hm-cell)" }}
                  >
                    {rowIndex < 6 && rowIndex % 2 === 0 ? DAYS[locale][rowIndex / 2] : ""}
                  </div>
                ))}
              </div>

              <div
                ref={heatmapGridRef}
                className="flex gap-[var(--hm-gap)]"
                style={{ width: WEEK_GRID_WIDTH }}
                onPointerMove={shouldAnimateHover ? handleGridPointerMove : undefined}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[var(--hm-gap)]">
                    {week.map((date, dayIndex) => {
                      const dateStr = date.toISOString().slice(0, 10);
                      const count = countMap.get(dateStr) || 0;
                      const { energy, offsetX, offsetY } = shouldAnimateHover
                        ? getCellResponse(trailCell, weekIndex, dayIndex, pointerTrend)
                        : { energy: 0, offsetX: 0, offsetY: 0 };
                      const highlightOpacity = energy * 0.52;
                      const blurOpacity = energy * 0.68;
                      const zIndex = energy > 0 ? 2 + Math.round(energy * 10) : 1;
                      const revealDelay = getCellRevealDelay(weekIndex, dayIndex);
                      const cellTransition: Transition = isRevealing
                        ? {
                            opacity: {
                              duration: CELL_ENTER_DURATION,
                              delay: revealDelay,
                              ease: "easeOut" as const,
                            },
                            scale: {
                              type: "spring" as const,
                              stiffness: 520,
                              damping: 24,
                              mass: 0.38,
                              delay: revealDelay,
                            },
                            x: CELL_TRANSITION,
                            y: CELL_TRANSITION,
                            boxShadow: CELL_TRANSITION,
                          }
                        : CELL_TRANSITION;

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
                              ? () => handleCellPointerEnter(weekIndex, dayIndex)
                              : undefined
                          }
                          initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
                          animate={{
                            opacity: 1,
                            scale: 1 + energy * 0.13,
                            x: offsetX,
                            y: offsetY,
                            boxShadow:
                              energy > 0
                                ? `0 0 0 1px rgba(244, 234, 216, ${0.08 + energy * 0.18}), 0 ${1 + energy * 3}px ${2 + energy * 8}px rgba(234, 201, 119, ${energy * 0.18})`
                                : "0 0 0 0 rgba(0, 0, 0, 0)",
                          }}
                          transition={cellTransition}
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

            <div className="hm-label mt-4 flex items-center justify-end gap-1.5 text-[10px]">
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
