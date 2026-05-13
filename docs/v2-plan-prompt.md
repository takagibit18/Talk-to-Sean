# V2 Enhancement Plan — Prompt

---

## Role

You are a **senior frontend engineer and UI motion designer** specializing in React, Next.js 15 App Router, Tailwind CSS, and Framer Motion 12. You write production-grade TypeScript and treat animation as a core UX function, not decoration. Your motion work is subtle, performant (GPU-composited, `will-change` scoped, `useReducedMotion` respected), and always behind a `MotionConfig` SSR-safe boundary.

---

## Objectives

### 1. Contribution Heatmap — Premium Motion Upgrade

Elevate the existing GitHub-style heatmap (`ContributionHeatmap.tsx`) animations from basic spring transitions into a refined, organic feel:

- **Cell enter animation**: On first paint, cells stagger-reveal row by row or in a wave pattern (week index → day index), each cell fading from `opacity: 0` with a slight scale pop (`0.85 → 1`) over 60–80 ms per cell.
- **Liquid hover effect** *(existing)*: Keep the current `pointer`-driven liquid distortion but tighten the parameters — reduce radius slightly, increase energy damping, ensure the glow trail feels responsive and frictionless without overshoot.
- **Idle shimmer**: A very subtle shimmer/glow pulse travels across the grid on idle (every 6–8 seconds), as if light sweeps across the panel. Must pause when user hovers.
- **Total contributions counter**: Animate the number on first view (count-up from 0 to N over 800–1200 ms with ease-out).
- **Respect reduced motion**: All above must degrade gracefully — instant reveal, no shimmer, static counter.

### 2. Chatbot Experience Overhaul

Improve the `/chat` page interaction quality:

- **Streaming output**: Token-by-token typewriter rendering from the AI response stream. Use a smooth caret blink at the end of the last token while the stream is active. Completed messages should have a subtle fade-in of the full block.
- **Enter to send**: Pressing `Enter` (without Shift) sends the message. `Shift+Enter` inserts a newline. Mobile: soft-return sends, newline via button.
- **Auto-scroll**: Chat container scrolls smoothly to bottom on new tokens (use `scroll-behavior: smooth` or programmatic `scrollIntoView({ behavior: 'smooth' })`). If user has manually scrolled up more than 120 px, suppress auto-scroll and show a floating "↓ New" pill to jump back.
- **Message bubbles**: Sender and receiver bubbles animate in on mount — user message slides in from right with `opacity + translateX`, bot message fades in from left. Staggered per-message on page load.
- **Empty state / welcome**: A friendly placeholder with a subtle pulse animation on the input field when the chat is empty.
- **Error & loading states**: Graceful error toast with retry; typing indicator (3-dot bounce) while waiting for first token.

### 3. Hero Background — Ambient Particle / Geometry Drift

Add a non-intrusive, performant animated background behind or above the hero section:

- **Implementation**: A `<canvas>`-based or SVG-based layer with 15–25 low-opacity geometric shapes (circles, blurred polygons, thin line rings) that drift slowly across the viewport at varying speeds (parallax-lite).
- **Motion**: Shapes move in gentle sinusoidal paths, never crossing the center text legibility zone. Speeds between 0.3–1.2 px/frame equivalent. Shapes fade out and respawn at random edges.
- **Performance**: `requestAnimationFrame` loop with delta-time clamping. `will-change: transform` on the canvas wrapper. No layout thrashing. Pause when tab not visible (`page visibility API`). Disable entirely when `prefers-reduced-motion` is active.
- **Styling**: Shapes use the existing palette (`--color-accent-strong`, gold/amber tones at low opacity). A subtle CSS `backdrop-filter: blur` or mix-blend-mode overlay may soften them.
- **Boundary**: This is hero-section only, NOT full-page. It must not block text selection or pointer events.

### 4. Tech Stack Section — Staggered Scroll Reveal

The skills/tech stack chips must animate on scroll entry:

- **Trigger**: On scroll into view (use `framer-motion` `whileInView` with `amount: 0.3`), each chip animates sequentially with a 60–80 ms stagger delay.
- **Animation per chip**: `fadeUp` (opacity 0 → 1, y 12 → 0) + `scale` (0.92 → 1), duration 350 ms, ease `[0.22, 0.68, 0.2, 1]`.
- **Stagger**: Parent container uses `staggerChildren`. Order: left-to-right, top-to-bottom (DOM order).
- **Hover enhancement**: On `whileHover`, chip lifts 2–4 px (`y: -3`), adds a soft glowing border (`boxShadow: 0 0 8px var(--color-accent-strong, rgba(234,201,119,0.4))`), and scales slightly (1.03). Transition: spring, stiffness 400, damping 22. Existing `cv-chip:hover` CSS remains as fallback.
- **Respect reduced motion**: All enter animations skip; hover lift still works (it's subtle and functional).

### 5. Page-Level Micro-Interactions

Add ambient feedback that makes the page feel alive:

- **Scroll progress indicator**: A thin (2–3 px) gradient bar fixed at the very top of the viewport that fills from 0% to 100% as the user scrolls from top to document bottom. Uses `scaleX` transform (GPU-composited) driven by a scroll event listener throttled via `requestAnimationFrame`. Hidden when `prefers-reduced-motion`.
- **Cursor glow / spotlight**: On the hero and activity sections only, a soft radial gradient glow follows the mouse cursor at a lagging distance (lerp, factor 0.08–0.12). Size: ~300–400 px radius. Opacity: 0.06–0.10. Must NOT follow on touch devices. Uses a positioned `<div>` with `pointer-events: none` and `transform: translate(x, y)` updated via `mousemove` listener on the section wrapper. Disabled below 768 px width.
- **Scroll-triggered section fades**: As sections enter the lower 30% of the viewport, they do a subtle `opacity + translateY` fade-up (already partially implemented with existing `whileInView` — ensure consistency).

---

## Boundaries (What NOT to change)

- Do **NOT** modify the data-fetching layer (`lib/contributions.ts`, `lib/github.ts`, `lib/config.ts`) unless a new animation absolutely requires a data shape change — and even then, keep it additive.
- Do **NOT** change the layout skeleton or CSS custom properties (`var(--hm-*)`, `var(--color-*)`). Add new properties if needed, but don't rename or remove existing ones.
- Do **NOT** touch `middleware.ts`, `next.config.ts`, or any build/route configuration.
- Do **NOT** add new npm dependencies unless strictly necessary. If a dependency is needed, justify it explicitly.
- Do **NOT** break the existing static export / ISR behavior. Client-side only features must degrade gracefully when JS is disabled.
- Do **NOT** regress accessibility: keep `aria-*` attributes, focus management, keyboard navigation intact.

---

## Acceptance Criteria

| # | Feature | Criterion |
|---|---------|-----------|
| 1 | Heatmap cells | Cells animate on first load with visible stagger. Hover liquid effect still works. Idle shimmer pulses every 6–8 s. Counter counts up. |
| 2 | Chatbot streaming | Tokens appear progressively. Enter submits, Shift+Enter adds newline. Auto-scroll follows new content; manual scroll-up shows "↓ New" pill. |
| 3 | Hero particles | Geometric shapes drift slowly without jank. Shapes don't overlap primary text. CPU usage stays within 3–5% on mid-range devices. |
| 4 | Tech stack stagger | Chips fade+scale in on scroll. Hover lifts and glows. No layout shift on animate. |
| 5 | Scroll progress | Bar animates smoothly from 0–100% on scroll. No jitter. Hidden on reduced motion. |
| 6 | Cursor glow | Glow follows mouse on hero/activity sections. Lerp lag feels natural. Not active on touch. |
| 7 | Reduced motion | All animation-heavy features degrade to instant/static when `prefers-reduced-motion: reduce`. |
| 8 | No regressions | Existing pages render correctly. No hydration warnings. Build succeeds. |

---

## Execution Rules

- **Timeouts**: Every `npm run dev`, `npm run build`, or test command MUST include a timeout (max 120 s for build, 30 s for dev). If a command hangs, kill it and report which step failed. Never retry the same command more than twice without investigating root cause.
- **Incremental verification**: After each objective is implemented, start the dev server, visually verify via the browser or via HTML output inspection, then stop the server before moving to the next objective. Do NOT leave dev servers running in the background across objectives.
- **Commit strategy**: Commit each objective as a separate, atomic commit with a descriptive message prefixed by the objective number (e.g., `feat(v2): #1 heatmap premium motion upgrade`).
- **No long-running loops**: Do not poll, sleep-wait, or run unbounded monitors. Use one-shot commands with explicit exit conditions.
