# Motion Runtime Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This plan must be executed inline because the user explicitly prohibited subagents.

**Goal:** Preserve the approved visual baseline while making every existing homepage motion finite, state-consistent, visibility-aware, reduced-motion safe, and free of hidden Fluid Cursor work.

**Architecture:** A reusable `useSignalCycle` hook owns the `idle → processing → verified → stable` lifecycle and its single timer. `RepoGrid` coordinates project ownership so only one architecture can process. `IconCloud` keeps one canvas initialization, draws only orbit/background signals, and projects the same sphere coordinates into DOM buttons that own the icon, label, hit area, and focus ring. Explicit viewport, document visibility, reduced-motion, and unmount gates control its single RAF.

**Tech Stack:** React 19, TypeScript, Framer Motion, Vitest fake timers, Testing Library, Playwright/Chromium.

## Global Constraints

- Keep the current warm solid backgrounds, tokens, disabled page grain, layout, typography, spacing, content, panel dimensions, and light/dark themes unchanged.
- Do not add dependencies, canvases, shaders, animation types, or unrelated visual refactors.
- Fluid Cursor source remains in the repository, but its feature flag is off and Hero never mounts it.
- Icon Cloud is the only continuous ambient motion, and only while visible, intersecting, mounted, and not reduced-motion.
- Hero, project architecture, capability signals, heatmap scans, and all other system motion are finite.
- All production behavior changes follow RED → GREEN → REFACTOR and finish with lint, typecheck, unit, E2E, and production-build verification.

---

### Task 1: Shared Signal Cycle

**Files:**

- Create: `components/motion/useSignalCycle.ts`
- Modify: `lib/motion-system.ts`
- Test: `tests/signal-cycle.test.tsx`

**Interfaces:**

- Produces: `useSignalCycle(options)` returning `{ state, replay, begin, verify, settle, settleAfter, cancel }`.
- Produces: `SIGNAL_CYCLE_TIMINGS` for Hero, project, and capability exit timing.
- Guarantees: one pending timer maximum, duplicate replay suppression, unmount cleanup, hidden-document settlement, and immediate stable state under reduced motion.

- [ ] Write fake-timer tests for the full state sequence, replay, duplicate triggers, cleanup, hidden document, and reduced motion.
- [ ] Run `npm test -- tests/signal-cycle.test.tsx` and confirm failures because the hook does not exist.
- [ ] Implement the hook with one timer ref and synchronous state ref.
- [ ] Run `npm test -- tests/signal-cycle.test.tsx` and confirm all signal-cycle tests pass.

### Task 2: Runtime-disable Fluid Cursor and stabilize Hero Trace

**Files:**

- Create: `lib/motion-feature-flags.ts`
- Modify: `components/cv/Hero.tsx`
- Modify: `app/home.css`
- Test: `tests/fluid-cursor-disabled.test.tsx`
- Test: `tests/homepage-agent-system.test.tsx`

**Interfaces:**

- Produces: `MOTION_FEATURE_FLAGS.fluidCursor === false`.
- Consumes: `useSignalCycle({ autoStart: true, ...SIGNAL_CYCLE_TIMINGS.hero })`.
- Exposes: Hero `data-motion-state` and synchronized heading/result states.

- [ ] Write a test that mocks `FluidCursor` and proves Hero never invokes it even on a fine-pointer, non-reduced client.
- [ ] Write a fake-timer Hero test for idle, processing, verified, and stable semantics.
- [ ] Run the focused tests and confirm the current mount and hard-coded Processing state fail.
- [ ] Add the explicit feature flag and conditionally omit the Fluid Cursor subtree.
- [ ] Bind Hero copy, rail, nodes, and result to the shared state; make CSS animations finite and processing-only.
- [ ] Run the focused tests and confirm they pass.

### Task 3: Single-lifecycle, single-coordinate Icon Cloud

**Files:**

- Modify: `components/motion/IconCloud.tsx`
- Modify: `app/home.css`
- Create: `tests/icon-cloud-lifecycle.test.tsx`

**Interfaces:**

- Produces: exported `projectIconCloudPoint(point, rotation, width, height)`.
- Exposes: root attributes `data-animation-state`, `data-initialization-count`, `data-rotation-tick`, and `data-active-label` for runtime verification.
- Consumes: stable item data plus active/selected label refs without including interaction arrays in the initialization effect.

- [ ] Write a controllable IntersectionObserver/RAF test harness.
- [ ] Assert a hover rerender does not call `canvas.getContext` again, replace DOM nodes, reset rotation, or reload logos.
- [ ] Assert viewport exit, document hidden, reduced motion, and unmount cancel RAF; reentry resumes the prior tick.
- [ ] Assert each DOM button receives the projected `translate3d`, scale, opacity, and z-index and contains its visible icon and label.
- [ ] Run the focused test and confirm current fixed CSS coordinates and effect dependency fail.
- [ ] Move logo/glyph rendering into DOM nodes, leave only orbit/background drawing in Canvas, and update both from `projectIconCloudPoint`.
- [ ] Add one stable RAF controller gated by intersection, visibility, reduced motion, context, and mounted state.
- [ ] Remove fixed `nth-child` interaction coordinates and style the projected DOM nodes without changing panel geometry.
- [ ] Run the focused test and confirm it passes.

### Task 4: Stable two-way Capability linking

**Files:**

- Modify: `components/cv/Skills.tsx`
- Modify: `components/cv/CapabilityMatrix.tsx`
- Test: `tests/capability-mapping.test.ts`
- Test: `tests/homepage-agent-system.test.tsx`

**Interfaces:**

- Consumes: Icon Cloud preview/end/toggle callbacks and `useSignalCycle` manual states.
- Produces: transient hover/focus mapping, 260ms delayed stable exit, and persistent click/touch selection.
- Preserves: the exact `CLOUD_TECH_RELATIONS` mapping.

- [ ] Add bidirectional mapping and unrelated-node tests.
- [ ] Add interaction tests for rapid row switching, delayed exit, keyboard focus, click persistence, switching, and deselection.
- [ ] Run focused tests and confirm current one-way immediate state replacement fails.
- [ ] Centralize preview/selection state in Skills and route all exit delay through the Signal Cycle timer.
- [ ] Render stable by default, processing only for transient linkage, and selected mappings as stable persistent state.
- [ ] Run focused tests and confirm they pass without Icon Cloud reinitialization.

### Task 5: Exclusive, uninterrupted Project Architecture cycles

**Files:**

- Modify: `components/RepoGrid.tsx`
- Modify: `components/cv/ProjectCard.tsx`
- Modify: `components/motion/SignalSystem.tsx`
- Modify: `app/home.css`
- Test: `tests/homepage-agent-system.test.tsx`

**Interfaces:**

- `RepoGrid` produces `activeProjectId`, queued viewport starts, and interaction preemption.
- `ProjectCard` consumes ownership and emits request/settled events.
- `ArchitectureDiagram` consumes `SignalState` rather than a Boolean.

- [ ] Add fake-timer tests that a 60ms skim completes processing → verified → stable and mouse leave never truncates it.
- [ ] Add a two-project test proving no simultaneous processing and stable settlement before handoff.
- [ ] Run focused tests and confirm the current Boolean/timer implementation fails.
- [ ] Replace each Boolean timer with `useSignalCycle`; remove mouse-leave and blur cancellation.
- [ ] Add the RepoGrid coordinator and bind diagram line/node/status data to the same state.
- [ ] Run focused tests and confirm they pass.

### Task 6: Remove non-budgeted continuous motion and enforce reduced motion

**Files:**

- Modify: `components/motion/MergeWardenFlow.tsx`
- Modify: `app/home.css`
- Test: `tests/home-visual-upgrade.test.tsx`

**Interfaces:**

- Removes: unconditional `useAnimationFrame` and all `repeat: Infinity` motion outside Icon Cloud.
- Preserves: static orbit layout, content, hover/focus selection, and finite detail transitions.

- [ ] Add a source/runtime assertion that the homepage has no continuous MergeWarden RAF or repeat loop.
- [ ] Run the focused test and confirm the existing implementation fails.
- [ ] Keep the diagram in its deterministic stable frame and retain only finite interaction transitions.
- [ ] Run the focused test and confirm it passes.

### Task 7: Browser evidence and full verification

**Files:**

- Artifact only: `artifacts/motion-stability/after/*`

- [ ] Run the motion audit at 1440×900 and save five 5–10 second recordings, reduced-motion screenshot, and runtime JSON.
- [ ] Capture 1280×800, 390×844, dark/light, English/Chinese screenshots and verify no visual-baseline regression.
- [ ] Verify WebGL contexts are zero, Icon Cloud initialization stays one, rotation is continuous through hover, offscreen/background/reduced RAF deltas are zero, Project skim reaches stable, and Hero ends stable.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run e2e`.
- [ ] Run `npm run build`.
- [ ] Inspect `git diff --check`, `git diff --stat`, and the final working tree before reporting.
