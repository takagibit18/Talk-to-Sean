# Homepage Agent System Design

## Outcome

Rebuild the homepage as an observable Agent system while preserving the existing warm-black, ivory, gold, cyan, glass, grain, grid, theme, i18n, and GitHub-backed portfolio language. Recruiters should reach verified project evidence immediately after the hero, then understand the technology ecosystem and the systems it can deliver.

## Information architecture

The canonical section order is Projects, Skills, Activity, About, Education, Languages, Publications, Contact. Hero remains unnumbered. The same ordered configuration drives rendering, navigation anchors, mobile navigation, section numbering, telemetry, and active-section state.

## Hero

The hero keeps one availability state, name, role/value proposition, primary Projects CTA, secondary Talk to Sean CTA, low-weight CV link, and one three-stage Trace visual. Avatar, quote, duplicate identity/status labels, skill-signal list, extra badges, and scroll cue are removed to reduce competing elements by more than 25% without losing the system identity.

## Projects

Project data remains in `lib/project-highlights.ts` and GitHub metadata remains supplemental. Each project config adds a distinct architecture graph and two to four numeric metrics. MergeWarden metrics come from `docs/v3.1-plan-prompt.md` and the bilingual publication evidence. shotgunCV metrics come from the documented two-input, five-stage pipeline in `docs/interview-project-qna-50.md`; repository stars/forks remain supplemental metadata, not claimed performance.

Shared SVG primitives render nodes, edges, status, and a cyan Processing to gold Verified trace. Graph playback runs on first viewport entry and interaction, not as a permanent loop.

## Skills

The left column contains five real skill categories. The right column uses a compact 38/62 split: Icon Cloud above, Engineering Capability Matrix below. Eight representative technologies appear in the cloud. A shared active-technology state maps cloud nodes to capability rows and rows back to cloud nodes. Canvas remains the ambient ecosystem visual; accessible DOM nodes provide keyboard and touch activation and synchronize the canvas emphasis.

Capabilities are Agent Runtime, Evaluation, Backend, Infrastructure, and Retrieval. Copy and representative technologies only use capabilities already present in CV data and project documentation.

## Motion language

Central tokens define fast 180ms, normal 280ms, slow 460ms, ambient 8s, a shared easing curve, reveal/stagger variants, and four signal states: idle, processing, verified, stable. Ambient motion is low-opacity; system motion has a start/run/verify/end sequence; interaction displacement stays at or below 4px; reveal uses opacity and translateY only.

`prefers-reduced-motion` disables cloud rotation, automatic signals, scan lines, fluid cursor, and large displacement while preserving all static topology and information.

## Responsive and accessibility

Desktop uses rich two-column Skills and project layouts. Tablet compacts navigation and graphs. Mobile stacks project information, graph, metrics, summaries, and actions; Skills stacks categories, cloud, and matrix. All links, rows, and technology nodes have visible focus states and accessible names; decorative SVG parts are hidden. Color is reinforced with labels and state text.

## Verification

Unit tests lock canonical section order, Hero hierarchy, cloud/matrix bidirectional mapping, distinct project graphs, metric count/source labels, and reduced-motion behavior. Existing lint, typecheck, Vitest, production build, and Playwright viewport checks are run after implementation.

