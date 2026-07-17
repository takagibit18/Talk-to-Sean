"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/locale";
import type { ProjectArchitecture, ProjectArchitectureNode } from "@/lib/project-highlights";
import type { SignalState } from "@/lib/motion-system";
import { MOTION_TOKENS } from "@/lib/motion-system";

export function SignalNode({
  node,
  locale,
  cycleState,
}: {
  node: ProjectArchitectureNode;
  locale: Locale;
  cycleState: SignalState;
}) {
  return (
    <g
      className="signal-node"
      data-state={node.state}
      data-cycle-state={cycleState}
      data-active={cycleState === "processing" ? "true" : "false"}
      transform={`translate(${node.x} ${node.y})`}
    >
      <rect x="-55" y="-18" width="110" height="36" rx="8" />
      <circle cx="-42" cy="0" r="3.5" />
      <text x="4" y="1" textAnchor="middle" dominantBaseline="middle">
        {node.label[locale]}
      </text>
    </g>
  );
}

export function SignalLine({
  x1,
  y1,
  x2,
  y2,
  state,
  delay,
  gradientId,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  state: SignalState;
  delay: number;
  gradientId: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <g className="signal-line" data-active={state === "processing" ? "true" : "false"}>
      <line className="signal-line__base" x1={x1} y1={y1} x2={x2} y2={y2} />
      <motion.line
        className="signal-line__flow"
        style={{ stroke: `url(#${gradientId})` }}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        initial={false}
        animate={
          reducedMotion || state === "verified" || state === "stable"
            ? { pathLength: 1, opacity: 0.65 }
            : state === "idle"
              ? { pathLength: 0, opacity: 0 }
            : { pathLength: [0, 1, 1], opacity: [0, 1, 0.72] }
        }
        transition={{
          duration: MOTION_TOKENS.duration.slow * 2,
          delay,
          ease: MOTION_TOKENS.ease,
          times: [0, 0.75, 1],
        }}
      />
    </g>
  );
}

export function ArchitectureDiagram({
  architecture,
  locale,
  state,
}: {
  architecture: ProjectArchitecture;
  locale: Locale;
  state: SignalState;
}) {
  const nodeMap = new Map(architecture.nodes.map((node) => [node.id, node]));
  return (
    <div
      className="architecture-diagram"
      data-architecture-diagram={architecture.id}
      data-active={state === "processing" ? "true" : "false"}
      data-state={state}
      role="img"
      aria-label={architecture.label[locale]}
    >
      <svg viewBox="0 0 600 220" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${architecture.id}-signal`} x1="0" x2="1">
            <stop offset="0" stopColor="var(--color-cool)" />
            <stop offset="1" stopColor="var(--color-accent-strong)" />
          </linearGradient>
        </defs>
        {architecture.edges.map((edge, index) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          return (
            <SignalLine
              key={`${edge.from}-${edge.to}-${index}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              state={state}
              delay={index * MOTION_TOKENS.stagger}
              gradientId={`${architecture.id}-signal`}
            />
          );
        })}
        {architecture.nodes.map((node) => (
          <SignalNode key={node.id} node={node} locale={locale} cycleState={state} />
        ))}
      </svg>
    </div>
  );
}

export function SignalStatus({ state, label }: { state: SignalState; label: string }) {
  return (
    <span className="signal-state-label" data-state={state}>
      <span className={`signal-status signal-status--${state}`} aria-hidden />
      {label}
    </span>
  );
}
