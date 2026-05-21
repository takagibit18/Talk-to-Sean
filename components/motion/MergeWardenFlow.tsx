"use client";

import Image from "next/image";
import { useId, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  ChartNoAxesColumnIncreasing,
  FileStack,
  GitPullRequest,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
  Workflow,
} from "lucide-react";
import type { MotionValue } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/locale";

const FLOW_EASE = [0.22, 0.68, 0.2, 1] as const;
const ORBIT_SECONDS = 34;
const ORBIT_ICONS = [
  Wrench,
  Workflow,
  ShieldAlert,
  ChartNoAxesColumnIncreasing,
  FileStack,
] as const satisfies readonly LucideIcon[];

type OrbitHighlight = {
  label: string;
  detail: string;
};

const COPY = {
  en: {
    aria: "MergeWarden highlight orbit and PR safety flow",
    inputLabel: "Raw PR",
    hubLabel: "MergeWarden",
    outputLabel: "Safe merged PR",
    inputMeta: "Diff, CI signal, repo context",
    outputMeta: "Evidence checked, schema valid, merge ready",
    orbitHint: "Hover a highlight to pause the orbit.",
    highlights: [
      {
        label: "Tool Design",
        detail:
          "Tools are permission-tiered as readonly / write / execute, with allowlists, shell=False, environment cleanup, output truncation, and high-risk gating to enforce the Agent action boundary.",
      },
      {
        label: "Review Orchestration",
        detail:
          "The core loop is not a one-shot LLM call but a five-phase flow: prepare -> analyze -> execute -> process -> continue/stop. It continuously gathers context, invokes tools, and operates under budget and iteration limits.",
      },
      {
        label: "Failure Degradation",
        detail:
          "When models, tools, schema, or budget fail, the system returns structured errors and explicit stop reasons instead of failing silently or producing unconsumable natural-language output.",
      },
      {
        label: "Evaluability",
        detail:
          "Golden fixtures, workspace snapshot validation, schema validity, hit rate, and false positive rate form a stable eval gate, making Agent quality regression-testable rather than subjective.",
      },
      {
        label: "Context Management",
        detail:
          "The system supports diff hunks, file-level content, project structure, on-demand file reads, and overflow summaries, so the Agent retains the most critical review evidence within a limited token budget.",
      },
    ],
  },
  zh: {
    aria: "MergeWarden \u9879\u76ee\u4eae\u70b9\u73af\u5f62\u52a8\u753b\u4e0e PR \u5b89\u5168\u6d41",
    inputLabel: "\u539f\u59cb PR",
    hubLabel: "MergeWarden",
    outputLabel: "\u5b89\u5168\u5408\u5e76\u7684 PR",
    inputMeta: "Diff\u3001CI \u4fe1\u53f7\u3001\u4ed3\u5e93\u4e0a\u4e0b\u6587",
    outputMeta: "\u8bc1\u636e\u5bf9\u9f50\u3001schema \u5408\u6cd5\u3001\u53ef\u5408\u5e76",
    orbitHint: "\u60ac\u505c\u4eae\u70b9 chip \u53ef\u6682\u505c\u65cb\u8f6c\u5e76\u67e5\u770b\u7ec6\u8282\u3002",
    highlights: [
      {
        label: "\u5de5\u5177\u8bbe\u8ba1",
        detail:
          "\u5de5\u5177\u5c42\u6309 readonly / write / execute \u505a\u6743\u9650\u5206\u7ea7\uff0c\u5e76\u901a\u8fc7 allowlist\u3001shell=False\u3001\u73af\u5883\u6e05\u7406\u3001\u8f93\u51fa\u622a\u65ad\u548c\u9ad8\u5371\u95e8\u63a7\uff0c\u628a Agent \u7684\u884c\u52a8\u8fb9\u754c\u5de5\u7a0b\u5316\u3002",
      },
      {
        label: "\u5ba1\u67e5\u7f16\u6392",
        detail:
          "\u6838\u5fc3 loop \u4e0d\u662f\u4e00\u6b21\u6027 LLM \u8c03\u7528\uff0c\u800c\u662f prepare \u2192 analyze \u2192 execute \u2192 process \u2192 continue/stop \u7684\u4e94\u9636\u6bb5\u6d41\u7a0b\uff0c\u80fd\u6301\u7eed\u6536\u96c6\u4e0a\u4e0b\u6587\u3001\u8c03\u7528\u5de5\u5177\u3001\u53d7\u9884\u7b97\u548c\u8fed\u4ee3\u4e0a\u9650\u7ea6\u675f\u3002",
      },
      {
        label: "\u5931\u8d25\u964d\u7ea7\u80fd\u529b",
        detail:
          "\u5f53\u6a21\u578b\u3001\u5de5\u5177\u3001schema \u6216\u9884\u7b97\u51fa\u73b0\u95ee\u9898\u65f6\uff0c\u7cfb\u7edf\u4f1a\u8fd4\u56de\u7ed3\u6784\u5316\u9519\u8bef\u548c\u660e\u786e stop reason\uff0c\u800c\u4e0d\u662f\u9759\u9ed8\u5931\u8d25\u6216\u751f\u6210\u4e0d\u53ef\u6d88\u8d39\u7684\u81ea\u7136\u8bed\u8a00\u7ed3\u679c\u3002",
      },
      {
        label: "\u53ef\u8bc4\u6d4b\u6027",
        detail:
          "\u9879\u76ee\u628a golden fixtures\u3001workspace snapshot \u6821\u9a8c\u3001schema validity\u3001hit rate\u3001false positive rate \u505a\u6210\u7a33\u5b9a eval gate\uff0c\u8ba9 Agent \u8d28\u91cf\u53ef\u4ee5\u56de\u5f52\u6d4b\u8bd5\u800c\u4e0d\u662f\u9760\u4e3b\u89c2\u611f\u89c9\u3002",
      },
      {
        label: "\u4e0a\u4e0b\u6587\u7ba1\u7406",
        detail:
          "\u7cfb\u7edf\u652f\u6301 diff hunk\u3001\u6587\u4ef6\u7ea7\u5185\u5bb9\u3001\u9879\u76ee\u7ed3\u6784\u3001\u6309\u9700\u6587\u4ef6\u8bfb\u53d6\u548c\u6ea2\u51fa\u6458\u8981\uff0c\u8ba9 Agent \u80fd\u5728\u6709\u9650 token \u9884\u7b97\u5185\u4fdd\u7559\u6700\u5173\u952e\u7684\u5ba1\u67e5\u8bc1\u636e\u3002",
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    aria: string;
    inputLabel: string;
    hubLabel: string;
    outputLabel: string;
    inputMeta: string;
    outputMeta: string;
    orbitHint: string;
    highlights: OrbitHighlight[];
  }
>;

export default function MergeWardenFlow({ locale }: { locale: Locale }) {
  const detailId = useId();
  const reducedMotion = useReducedMotion();
  const copy = COPY[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);
  const activeHighlight = copy.highlights[activeIndex];
  const orbitStep = 360 / copy.highlights.length;
  const orbitPaused = reducedMotion || isOrbitPaused;
  const orbitAngle = useMotionValue(0);
  const orbitTransform = useTransform(
    orbitAngle,
    (value) => `translate(-50%, -50%) rotate(${value}deg)`,
  );
  const chipCounterTransform = useTransform(
    orbitAngle,
    (value) => `rotate(${-value}deg) rotate(var(--orbit-offset-negative))`,
  );

  useAnimationFrame((_, delta) => {
    if (orbitPaused) {
      return;
    }

    const nextAngle = orbitAngle.get() + (delta / 1000) * (360 / ORBIT_SECONDS);
    orbitAngle.set(nextAngle % 360);
  });

  return (
    <div
      className="mergewarden-flow"
      role="group"
      aria-label={copy.aria}
      data-testid="mergewarden-flow"
    >
      <div className="mergewarden-flow__rail mergewarden-flow__rail--left" aria-hidden>
        {["#123d45", "#35aeb7", "#7fc8cf"].map((color, index) => (
          <motion.span
            key={color}
            className="mergewarden-flow__packet"
            style={{ "--packet-color": color } as CSSProperties}
            animate={
              reducedMotion
                ? { opacity: 0.72, x: 0 }
                : { opacity: [0.22, 1, 0.26], x: [0, 11, 0] }
            }
            transition={{
              duration: 2.8,
              delay: index * 0.32,
              repeat: reducedMotion ? 0 : Infinity,
              ease: FLOW_EASE,
            }}
          />
        ))}
      </div>

      <FlowCard
        align="left"
        icon={<GitPullRequest size={20} />}
        label={copy.inputLabel}
        meta={copy.inputMeta}
      />

      <svg
        className="mergewarden-flow__connectors"
        viewBox="0 0 700 260"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id="mergewarden-flow-base" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(127, 200, 207, 0.18)" />
            <stop offset="50%" stopColor="rgba(53, 174, 183, 0.54)" />
            <stop offset="100%" stopColor="rgba(127, 200, 207, 0.2)" />
          </linearGradient>
          <linearGradient id="mergewarden-flow-glow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(74, 163, 255, 0.02)" />
            <stop offset="50%" stopColor="rgba(99, 227, 236, 0.28)" />
            <stop offset="100%" stopColor="rgba(74, 163, 255, 0.02)" />
          </linearGradient>
          <linearGradient id="mergewarden-flow-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(99, 227, 236, 0)" />
            <stop offset="42%" stopColor="rgba(99, 227, 236, 0.9)" />
            <stop offset="100%" stopColor="rgba(74, 163, 255, 0)" />
          </linearGradient>
          <radialGradient id="mergewarden-flow-particle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.96)" />
            <stop offset="48%" stopColor="rgba(99, 227, 236, 0.86)" />
            <stop offset="100%" stopColor="rgba(74, 163, 255, 0)" />
          </radialGradient>
        </defs>
        <path
          className="mergewarden-flow__connector-glow"
          d="M 84 132 C 158 126, 224 98, 304 112"
          stroke="url(#mergewarden-flow-glow)"
        />
        <path
          className="mergewarden-flow__connector-glow"
          d="M 396 112 C 476 98, 542 126, 616 132"
          stroke="url(#mergewarden-flow-glow)"
        />
        <path
          className="mergewarden-flow__connector-base"
          d="M 84 132 C 158 126, 224 98, 304 112"
          stroke="url(#mergewarden-flow-base)"
        />
        <path
          className="mergewarden-flow__connector-base"
          d="M 396 112 C 476 98, 542 126, 616 132"
          stroke="url(#mergewarden-flow-base)"
        />
        <motion.path
          className="mergewarden-flow__connector-wave mergewarden-flow__connector-wave--primary"
          d="M 84 132 C 158 126, 224 98, 304 112"
          stroke="url(#mergewarden-flow-wave)"
          initial={false}
          animate={
            reducedMotion
              ? { opacity: 0 }
              : { strokeDashoffset: [260, -160], opacity: [0.12, 1, 0.16] }
          }
          transition={{ duration: 3.2, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        />
        <motion.path
          className="mergewarden-flow__connector-wave mergewarden-flow__connector-wave--primary"
          d="M 396 112 C 476 98, 542 126, 616 132"
          stroke="url(#mergewarden-flow-wave)"
          initial={false}
          animate={
            reducedMotion
              ? { opacity: 0 }
              : { strokeDashoffset: [260, -160], opacity: [0.12, 1, 0.16] }
          }
          transition={{
            duration: 3.2,
            delay: reducedMotion ? 0 : 0.8,
            repeat: reducedMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          className="mergewarden-flow__connector-wave mergewarden-flow__connector-wave--secondary"
          d="M 84 132 C 158 126, 224 98, 304 112"
          stroke="url(#mergewarden-flow-wave)"
          initial={false}
          animate={
            reducedMotion
              ? { opacity: 0 }
              : { strokeDashoffset: [120, -250], opacity: [0, 0.62, 0] }
          }
          transition={{
            duration: 4.85,
            delay: reducedMotion ? 0 : 1.35,
            repeat: reducedMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          className="mergewarden-flow__connector-wave mergewarden-flow__connector-wave--secondary"
          d="M 396 112 C 476 98, 542 126, 616 132"
          stroke="url(#mergewarden-flow-wave)"
          initial={false}
          animate={
            reducedMotion
              ? { opacity: 0 }
              : { strokeDashoffset: [120, -250], opacity: [0, 0.62, 0] }
          }
          transition={{
            duration: 4.85,
            delay: reducedMotion ? 0 : 2.15,
            repeat: reducedMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
        {[
          { cx: [84, 156, 235, 304], cy: [132, 126, 99, 112], delay: 0 },
          { cx: [84, 156, 235, 304], cy: [132, 126, 99, 112], delay: 1.15 },
          { cx: [396, 465, 544, 616], cy: [112, 99, 126, 132], delay: 1.6 },
          { cx: [396, 465, 544, 616], cy: [112, 99, 126, 132], delay: 2.75 },
        ].map((particle) => (
          <motion.circle
            key={`${particle.cx[0]}-${particle.delay}`}
            className="mergewarden-flow__connector-particle"
            cx={particle.cx[0]}
            cy={particle.cy[0]}
            r="4.2"
            fill="url(#mergewarden-flow-particle)"
            initial={false}
            animate={
              reducedMotion
                ? { opacity: 0 }
                : {
                    cx: particle.cx,
                    cy: particle.cy,
                    opacity: [0, 1, 0.82, 0],
                    scale: [0.62, 1.1, 0.92, 0.58],
                  }
            }
            transition={{
              duration: 3.15,
              delay: reducedMotion ? 0 : particle.delay,
              repeat: reducedMotion ? 0 : Infinity,
              ease: FLOW_EASE,
            }}
          />
        ))}
        {[
          { cx: 304, cy: 112, delay: 0.88 },
          { cx: 396, cy: 112, delay: 2.45 },
        ].map((pulse) => (
          <motion.circle
            key={`${pulse.cx}-${pulse.delay}`}
            className="mergewarden-flow__connector-pulse"
            cx={pulse.cx}
            cy={pulse.cy}
            r="8"
            initial={false}
            animate={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: [0, 0.72, 0], r: [5, 18, 26] }
            }
            transition={{
              duration: 1.45,
              delay: reducedMotion ? 0 : pulse.delay,
              repeat: reducedMotion ? 0 : Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      <div className="mergewarden-flow__hub">
        <motion.div
          className={`mergewarden-flow__orbit${orbitPaused ? " is-paused" : ""}`}
          aria-label={copy.orbitHint}
          style={{ transform: orbitTransform }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsOrbitPaused(false);
            }
          }}
          onMouseLeave={() => setIsOrbitPaused(false)}
        >
          <span className="mergewarden-flow__orbit-track" aria-hidden />
          {copy.highlights.map((item, index) => (
            <OrbitChip
              key={item.label}
              item={item}
              icon={ORBIT_ICONS[index]}
              index={index}
              orbitStep={orbitStep}
              detailId={detailId}
              isActive={activeIndex === index}
              transform={chipCounterTransform}
              onActivate={() => {
                setActiveIndex(index);
                setIsOrbitPaused(true);
              }}
            />
          ))}
        </motion.div>

        <motion.div
          className="mergewarden-flow__logo"
          style={{ x: "-50%", y: "-50%" }}
          animate={reducedMotion ? { scale: 1 } : { scale: [1, 1.015, 1] }}
          transition={{ duration: 3.6, repeat: reducedMotion ? 0 : Infinity, ease: FLOW_EASE }}
        >
          <Image
            src="/mergewarden-logo-mark.png"
            width={512}
            height={512}
            alt="MergeWarden logo"
            className="mergewarden-flow__logo-img"
            unoptimized
            priority
          />
        </motion.div>

        <div className="mergewarden-flow__hub-copy">
          <strong>{copy.hubLabel}</strong>
        </div>

        <motion.div
          id={detailId}
          key={activeHighlight.label}
          className="mergewarden-flow__detail"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={reducedMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.24, ease: FLOW_EASE }}
        >
          <div className="mergewarden-flow__detail-heading">
            <span className="mergewarden-flow__detail-icon" aria-hidden>
              <Sparkles size={17} strokeWidth={2.35} />
            </span>
            <strong>{activeHighlight.label}</strong>
          </div>
          <span>{activeHighlight.detail}</span>
        </motion.div>
      </div>

      <FlowCard
        align="right"
        icon={<ShieldCheck size={20} />}
        label={copy.outputLabel}
        meta={copy.outputMeta}
      />

      <div className="mergewarden-flow__rail mergewarden-flow__rail--right" aria-hidden>
        {["#35aeb7", "#123d45", "#7fc8cf"].map((color, index) => (
          <motion.span
            key={color}
            className="mergewarden-flow__packet mergewarden-flow__packet--safe"
            style={{ "--packet-color": color } as CSSProperties}
            animate={
              reducedMotion
                ? { opacity: 0.72, x: 0 }
                : { opacity: [0.22, 1, 0.26], x: [0, 13, 0] }
            }
            transition={{
              duration: 2.8,
              delay: 1.1 + index * 0.32,
              repeat: reducedMotion ? 0 : Infinity,
              ease: FLOW_EASE,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function OrbitChip({
  item,
  icon: Icon,
  index,
  orbitStep,
  detailId,
  isActive,
  transform,
  onActivate,
}: {
  item: OrbitHighlight;
  icon: LucideIcon;
  index: number;
  orbitStep: number;
  detailId: string;
  isActive: boolean;
  transform: MotionValue<string>;
  onActivate: () => void;
}) {
  return (
    <div
      className="mergewarden-flow__orbit-slot"
      style={
        {
          "--orbit-offset": `${index * orbitStep}deg`,
          "--orbit-offset-negative": `${index * -orbitStep}deg`,
        } as CSSProperties
      }
    >
      <motion.button
        type="button"
        className="mergewarden-flow__orbit-chip"
        style={{ transform }}
        aria-describedby={detailId}
        aria-pressed={isActive}
        onClick={onActivate}
        onFocus={onActivate}
        onMouseEnter={onActivate}
      >
        <span className="mergewarden-flow__orbit-chip-icon" aria-hidden>
          <Icon size={16} strokeWidth={2.45} />
        </span>
        <span>{item.label}</span>
      </motion.button>
    </div>
  );
}

function FlowCard({
  align,
  icon,
  label,
  meta,
}: {
  align: "left" | "right";
  icon: ReactNode;
  label: string;
  meta: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`mergewarden-flow__card mergewarden-flow__card--${align}`}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.65, ease: FLOW_EASE }}
    >
      <span className="mergewarden-flow__card-icon">{icon}</span>
      <strong>{label}</strong>
      <span>{meta}</span>
    </motion.div>
  );
}
