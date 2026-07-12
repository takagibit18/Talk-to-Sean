# Homepage Agent System Implementation Plan

**Goal:** Rebuild the homepage information architecture, project evidence, skills capability system, and shared motion language without changing the existing stack or unrelated pages.

**Architecture:** Canonical data configurations own order and truthful content. Focused React components compose shared signal primitives, while centralized motion tokens keep Framer Motion and CSS behavior consistent. Existing theme variables, GitHub fetching, locale selection, Icon Cloud canvas, and section components are retained.

**Tech Stack:** Next.js 15, React 19, TypeScript, Framer Motion, Lucide, Tailwind/CSS, Vitest, Testing Library, Playwright.

## Global constraints

- Execute inline in the current workspace; do not use subagents.
- Preserve current user changes, theme switching, locale switching, chat/CV/external links, and stable dependencies.
- Do not invent project architecture, skills, or metrics.
- Support desktop, tablet, mobile, keyboard, touch, and `prefers-reduced-motion`.
- Use test-first red/green cycles and run fresh full verification before completion claims.

### Task 1: Canonical homepage contract

**Files:**
- Create: `lib/home-sections.ts`
- Modify: `components/HomeContent.tsx`, `components/cv/TopBar.tsx`, section components
- Test: `tests/homepage-agent-system.test.tsx`

- [ ] Write assertions for Projects-first order, canonical IDs, anchor links, active navigation, and numbers 01–08.
- [ ] Run `npm test -- tests/homepage-agent-system.test.tsx` and confirm the old order fails.
- [ ] Implement the shared section configuration and consume it from rendering/navigation/telemetry.
- [ ] Re-run the targeted test and existing homepage tests.

### Task 2: Motion system and Hero hierarchy

**Files:**
- Create: `lib/motion-system.ts`
- Modify: `components/cv/Hero.tsx`, `components/motion/SectionReveal.tsx`, `app/globals.css`
- Test: `tests/homepage-agent-system.test.tsx`

- [ ] Add failing assertions for one availability state, two primary actions plus a low-weight CV link, one trace, and absence of removed duplicate elements.
- [ ] Confirm failure, then implement centralized durations/easing/variants and the reduced Hero.
- [ ] Re-run targeted tests and verify reduced-motion static content.

### Task 3: Project data, diagrams, metrics, and cards

**Files:**
- Modify: `lib/project-highlights.ts`, `components/RepoGrid.tsx`
- Create: `components/motion/SignalSystem.tsx`, `components/cv/ProjectCard.tsx`
- Test: `tests/homepage-agent-system.test.tsx`, `tests/homepage-content-refresh.test.ts`

- [ ] Add failing assertions requiring unique graph IDs/topologies and two to four sourced numeric metrics per project.
- [ ] Confirm failure, extend typed project config, and implement reusable SVG signal primitives.
- [ ] Implement ProjectCard responsive composition and viewport/interaction-triggered graph motion.
- [ ] Re-run project and content tests.

### Task 4: Skills ecosystem and capability matrix

**Files:**
- Modify: `lib/cv-data.ts`, `components/cv/Skills.tsx`, `components/motion/IconCloud.tsx`
- Create: `components/cv/CapabilityMatrix.tsx`
- Test: `tests/homepage-agent-system.test.tsx`, `tests/home-visual-upgrade.test.tsx`

- [ ] Add failing assertions for five groups, eight representative cloud nodes, five capability rows, and bidirectional technology mapping.
- [ ] Confirm failure, add bilingual capability content and mapping data.
- [ ] Add accessible cloud controls and canvas emphasis driven by active labels.
- [ ] Add matrix hover/focus/touch activation and verified status labels.
- [ ] Re-run Skills and visual tests.

### Task 5: Styling, telemetry, heatmap, and responsive polish

**Files:**
- Modify: `app/globals.css`, `components/motion/SectionTelemetry.tsx`, `components/ContributionHeatmap.tsx`, `tests/e2e/homepage.spec.ts`

- [ ] Add/adjust viewport assertions for desktop, tablet, and mobile ordering and overflow.
- [ ] Apply shared motion/color/status tokens and remove permanent project/heatmap scans.
- [ ] Ensure focus-visible, touch behavior, light theme, no layout shift, and reduced-motion overrides.
- [ ] Run targeted unit tests and Playwright homepage/i18n checks.

### Task 6: Fresh full verification

- [ ] Run `npm run lint` and record exit/output.
- [ ] Run `npm run typecheck` and record exit/output.
- [ ] Run `npm test -- --reporter=dot` and record counts.
- [ ] Run `npm run build` and record exit/output.
- [ ] Run responsive browser checks at 1440×1000, 1024×900, and 390×844 and inspect console/overflow.
- [ ] Review the acceptance criteria line by line and report any remaining out-of-scope issues honestly.

