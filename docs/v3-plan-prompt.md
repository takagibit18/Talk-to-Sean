# V3 Enhancement Plan — Prompt

---

## Role

You are a **senior frontend engineer and UI motion designer** specializing in React, Next.js 15 App Router, Tailwind CSS, and Framer Motion 12. You write production-grade TypeScript and treat animation as a core UX function, not decoration. Your motion work is subtle, performant (GPU-composited, `will-change` scoped, `useReducedMotion` respected), and always behind a `MotionConfig` SSR-safe boundary.

---

## Core Objectives

### 1. Icon Cloud — Slower Rotation & Stronger Pointer Authority

Reduce the autonomous rotation speed of the tech stack icon cloud and increase the user's ability to steer it with the mouse/pointer.

**Current state** ([IconCloud.tsx](components/motion/IconCloud.tsx#L109-L110)):
- Auto-rotation: `tick * 0.011` (Y-axis) and `tick * 0.006` (X-axis) per frame — roughly 37°/s on Y at 60 fps.
- Pointer influence: `pointer.x * 0.82` (Y) and `-pointer.y * 0.62` (X), with `pointer` normalized to `[-0.5, 0.5]`.
- Pointer active speeds up the tick from 1 → 1.35, making the cloud spin faster under the cursor, which competes with the user's steering intent.

**Target behavior**:
- **Auto-rotation speed**: Reduce the Y-axis multiplier from `0.011` to roughly `0.003–0.005` and X-axis from `0.006` to `0.0015–0.003`. The cloud should feel like a slowly drifting object, not a spinning carousel. Fine-tune via visual testing — aim for a calm, ambient feel that takes 12–18 seconds for a full Y-axis revolution.
- **Pointer authority**: Increase the pointer multipliers to give the user dominant control. Pointer should be able to override ~60–80% of the visible rotation range. The auto-rotation acts as a gentle baseline that the pointer can easily overpower. Try increasing pointer multipliers proportionally relative to the reduced auto-speed, or add a separate sensitivity factor.
- **Remove the tick speed-up on pointer active** (line 218: `tick += pointer.active ? 1.35 : 1`). The pointer should steer, not accelerate. Keep tick increment constant at `1` regardless of pointer state.
- **Pointer ease-out on leave**: When the pointer leaves the canvas, the cloud should gradually decelerate back to auto-rotation over ~1.2–1.8 seconds using an easing function (ease-out cubic), rather than snapping instantly.
- **Respect reduced motion**: No change — cloud remains static when `prefers-reduced-motion: reduce`.

### 2. Icon Cloud — Replace Glyph Text with Logo Images

Replace the current 2-letter text glyphs and colored circles with actual tech stack logo images.

**Current state**: Each icon cloud item renders a colored circle with a 2-letter abbreviation (`glyph`) drawn inside it, plus a label text for front-facing chips.

**Target behavior**:
- **Image source**: A single sprite sheet / atlas image (`tech-logos.png` or similar) will be provided, containing all tech stack logos in a grid layout. Each logo cell occupies a square region. Alternatively, support individual logo images per item.
- **Data model change**: `IconCloudItem` must accept an optional `logo` / `imageUrl` field (or sprite coordinates if using a sprite sheet). The `glyph` field becomes optional — fallback to glyph text when no logo is available.
- **Rendering change**: Replace the `ctx.arc()` colored circle + `ctx.fillText(glyph)` with `ctx.drawImage()` for the logo. Logos should be rendered at the same position, centered on the chip, sized proportionally to the chip circle.
- **No label text on logos**: The front-facing chips that currently show `item.label` text should no longer show text — the logo image alone identifies the technology. Remove or significantly reduce the label text area so the logo is the primary visual.
- **Visual quality**: Use `imageSmoothingEnabled = true` for crisp rendering. Pre-load the sprite/image before the first draw to avoid flickering. Handle DPR scaling correctly — draw the image at the logical size with `ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)` mapped to DPR-aware coordinates.
- **Fallback**: If an image fails to load, fall back to the existing glyph+circle rendering.

### 3. Hero Name — Position-Aware Gradient Hover Effect

Upgrade the hero page name ("Sean Yu") hover effect from a uniform animation to one where the text color shifts dynamically based on the mouse cursor position.

**Current state** ([TextHoverEffect.tsx](components/motion/TextHoverEffect.tsx#L15-L26)): On hover, the base text fades out, a gold stroke layer appears with a fixed `x: 4, y: -3` offset, and a gradient fill sweeps across the text via the `textHoverSweep` CSS keyframe — the same animation plays regardless of where the cursor is.

**Target behavior**:
- **Mouse tracking**: Track the mouse position relative to the text element (`mousemove` on the wrapper). Normalize coordinates to `[0, 1]` across the element's bounding rect (left→right, top→bottom).
- **Dynamic gradient**: The fill layer's gradient should shift its center/angle based on mouse position. For example:
  - Horizontal position (`normalizedX`) controls the gradient stop positions — e.g., the gold/amber portion of the gradient follows the cursor horizontally.
  - Vertical position (`normalizedY`) controls the gradient angle or brightness intensity.
  - The stroke layer's offset (`x`, `y`) should also respond to mouse position — e.g., mouse on the left → stroke shifts right, mouse on top → stroke shifts down, creating a parallax-like depth effect with a range of ±4–6 px.
- **Performance**: Debounce `mousemove` via `requestAnimationFrame` or use framer-motion's `useMotionValue` + `useSpring` for GPU-composited updates. Avoid triggering re-renders on every pixel move — update CSS custom properties directly or use `MotionValue.set()`.
- **Leave behavior**: On mouse leave, the text returns to its default (un-hovered) state smoothly over ~400–600 ms.
- **Fallback for touch**: Touch devices cannot provide continuous position data without a tap. On touch, fall back to the original uniform hover effect (touch → activate, no position tracking).
- **Respect reduced motion**: When `prefers-reduced-motion: reduce`, skip position tracking and use the original uniform hover effect.

---

## Modules to Modify

| Module | File | Changes |
|--------|------|---------|
| IconCloud | `components/motion/IconCloud.tsx` | Slow down auto-rotation constants; boost pointer multipliers; remove pointer tick speed-up; add pointer-leave ease-out decay; add image rendering support with `drawImage()`; update `IconCloudItem` type to accept optional `logo` field |
| Skills section | `components/cv/Skills.tsx` | Update `TECH_STACK_ICONS` data array — replace `glyph` values with logo image references |
| TextHoverEffect | `components/motion/TextHoverEffect.tsx` | Add `mousemove` position tracking; compute dynamic gradient from normalized mouse coords; add spring-animated stroke offset tied to pointer position; handle touch fallback |
| Global CSS | `app/globals.css` | Update `.text-hover-effect` styles — replace the uniform `:hover` sweep keyframe with CSS custom properties (`--mouse-x`, `--mouse-y`) that the JS updates, so the gradient follows the cursor |
| Static assets | `public/` | Add the tech stack logo sprite sheet or individual logo images |

---

## Boundaries (What NOT to change)

- Do **NOT** change the Canvas rendering pipeline architecture — keep the `requestAnimationFrame` loop, DPR handling, and `ResizeObserver` pattern intact. Only modify the rotation parameters, pointer behavior, and drawing of individual items.
- Do **NOT** modify the Fibonacci sphere point distribution (`createSpherePoints`) or the perspective projection math (`project()`) — the sphere layout and depth sorting logic remain unchanged.
- Do **NOT** change the hero section layout, typography scale (`cv-hero-name`), or the three-layer text stack architecture (`__base`, `__stroke`, `__fill`).
- Do **NOT** modify the data-fetching layer (`lib/cv-data.ts`, `lib/contributions.ts`, `lib/github.ts`).
- Do **NOT** touch `middleware.ts`, `next.config.ts`, or any build/route configuration.
- Do **NOT** add new npm dependencies unless strictly necessary. If a dependency is needed, justify it explicitly.
- Do **NOT** break the existing static export / ISR behavior. Client-side only features must degrade gracefully when JS is disabled.
- Do **NOT** regress accessibility: keep `aria-label` on the canvas, `aria-hidden` on decorative text layers, keyboard navigation intact.
- Do **NOT** change any other sections of the page (activity heatmap, chatbot, CV sections, etc.).

---

## Acceptance Criteria

| # | Feature | Criterion |
|---|---------|-----------|
| 1 | Slower rotation | Icon cloud auto-rotation completes one full Y-axis revolution in 12–18 seconds. Cloud feels calm and ambient, not spinning. |
| 2 | Pointer authority | Mouse movement can steer the cloud across ~60–80% of its visible rotation range. User feels in direct control, not fighting auto-rotation. |
| 3 | No speed-up on hover | Tick increment remains constant (1). Hovering does not accelerate the cloud. |
| 4 | Pointer leave decay | After the cursor leaves the canvas, the cloud gently decelerates back to auto-rotation over 1.2–1.8 seconds (no snap). |
| 5 | Logo rendering | Each icon cloud chip displays the corresponding tech logo image instead of a colored circle + 2-letter glyph. Logos are crisp (DPR-aware) and centered. |
| 6 | No label text on chips | Front-facing chips show only the logo, no text label. The logo itself is sufficient identification. |
| 7 | Image fallback | If a logo image fails to load, the chip falls back to the original glyph+circle rendering. |
| 8 | Position-aware name hover | Moving the mouse left-to-right across the name changes the gradient position. Moving top-to-bottom changes the stroke offset. The effect is continuous, not binary. |
| 9 | Touch fallback | On touch devices, the name hover falls back to the original uniform animation (no position tracking). |
| 10 | Leave transition | When the mouse leaves the name, the gradient and stroke smoothly return to default over 400–600 ms. |
| 11 | Reduced motion | All three features degrade gracefully — static cloud, logo images still render (no animation to degrade), uniform hover effect on name. |
| 12 | No regressions | Existing pages render correctly. No hydration warnings. Build succeeds (`npm run build`). Canvas rendering performance stays within budget (no frame drops below 60 fps on mid-range devices). |

---

## Execution Rules

- **Incremental verification**: After each objective is implemented, start the dev server, visually verify via the browser, then stop the server before moving to the next objective. Do NOT leave dev servers running in the background across objectives.
- **Commit strategy**: Commit each objective as a separate, atomic commit with a descriptive message prefixed by the objective number (e.g., `feat(v3): #1 slow down icon cloud rotation and improve pointer control`).
- **Test before commit**: Run `npm run build` after each objective to catch regressions early. If the build fails, fix before committing.
- **No long-running loops**: Do not poll, sleep-wait, or run unbounded monitors. Use one-shot commands with explicit exit conditions.
- **Image coordination**: For objective #2, ask the user to provide the logo sprite sheet / image files before implementation begins. Define the expected image format and coordinate mapping upfront.
