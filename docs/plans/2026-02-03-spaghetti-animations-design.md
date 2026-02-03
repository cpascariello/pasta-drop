# Spaghetti Animations Design

**Date:** 2026-02-03
**Scope:** Two animation features — button micro-animation + floating background emojis

---

## Feature 1: Button Spaghetti Spinner

A spaghetti emoji (🍝) on the "Al dente" button that spins continuously.

**Behavior:**
- Emoji placed before the button text: `🍝 Al dente`
- CSS `@keyframes` rotation with `ease-in-out` timing (not linear — gives impression of weight)
- **Idle speed:** ~1200-1500ms per rotation (lazy twirl, decorative)
- **Loading speed:** ~800ms per rotation (signals activity) — swap via CSS class
- `<span>` wrapping the emoji must be `display: inline-block` (transforms don't apply to inline elements)
- Emoji rotation can appear off-center on some platforms — test on Windows/Chrome

**Applies to:**
- "Al dente" button (Editor)
- Optionally "Cook your own" button (Viewer)

**Accessibility:**
- Wrap in `@media (prefers-reduced-motion: reduce)` — show static emoji, no spin

---

## Feature 2: Floating Spaghetti Background

Spaghetti emojis drifting lazily around the viewport like a lava lamp, with mouse repulsion and edge wrapping.

### Visual Properties (randomized per emoji)

| Property | Range | Notes |
|----------|-------|-------|
| Count | 10 desktop / 6 mobile | `matchMedia('(max-width: 767px)')`, checked on mount + threshold change |
| Font size | 24-40px | Most 28-32px, a few small (24px), one or two large (36-40px) |
| Opacity | 0.10-0.15 | Larger emojis slightly lower opacity for depth illusion |
| Drift speed | 20-40px/s | Randomized per emoji at init |
| Wobble | ±15deg | `sin(time * 0.0008 + seed) * 15` — slow rotation wobble |

### Movement Model

**Base drift with sinusoidal modulation (not constant velocity):**
- Each emoji drifts at its base speed
- Add sinusoidal oscillation: `x += vx + sin(time * 0.001 + phaseX) * 0.3`
- Each emoji gets unique phase offsets for x and y — creates smooth, non-repeating wandering paths
- Vary speeds between emojis (assigned at init from the 20-40px/s range)

**Edge wrapping (not bouncing):**
- When an emoji fully exits one edge, it re-enters from the opposite edge
- Account for emoji size in boundary: emoji must be fully off-screen before wrapping
- Wrapping reads as ambient/lava-lamp; bouncing reads as DVD screensaver

**Mouse repulsion:**
- Outer radius: **130px** (force = 0% at edge)
- **Inverse-square falloff:** `force = strength / (distance * distance)` — concentrated push near cursor, drops off fast
- Dead zone: ~30px around cursor where force is capped at maximum (prevents escape-velocity launches)
- Velocity cap: **60-80px/s** max from repulsion
- Damping: **0.96 per frame** (adjusted for delta-time) — heavy/gloopy feel
- On mobile: no mouse tracking, emojis just float and wrap

### Entrance

- **Staggered fade-in:** emojis appear one by one over ~1.5-2s (150-200ms stagger per emoji)
- Each emoji fades from opacity 0 to its target opacity
- Random initial positions across full viewport

### Implementation

**`useFloatingEmojis` hook — owns all physics, no React re-renders:**
- Positions, velocities, mouse coords all stored in `useRef` (never `useState`)
- DOM updated directly via element refs (`ref.style.transform`, `ref.style.opacity`)
- Single `requestAnimationFrame` loop for all emojis
- **Delta-time based:** use `performance.now()` difference between frames for frame-rate-independent movement
- Damping applied as exponential decay per delta-time (not per-frame multiply)
- `visibilitychange` listener: pause RAF when tab hidden, resume when visible (prevents delta-time spike / teleporting)
- Cleanup: store RAF ID in ref, `cancelAnimationFrame` in useEffect cleanup
- Emoji count via `matchMedia` listener (fires once per threshold, no debounce needed)

**`<FloatingEmojis />` component:**
- Renders absolutely-positioned `<span>` elements
- `pointer-events: none` on container and individual spans
- `transform: translate3d(x, y, 0)` for reliable GPU compositing
- `will-change: transform` on each span
- Container: `position: fixed`, `inset: 0`, `z-index: 0`, `overflow: hidden`

**Accessibility:**
- `@media (prefers-reduced-motion: reduce)`: hide floating emojis entirely
- `aria-hidden="true"` on container

### Performance Notes
- Direct DOM mutation bypasses React reconciliation — zero re-renders from animation
- Single RAF loop (not one per emoji)
- 10 compositor layers is fine on modern devices; test on throttled mobile
- Use `document.documentElement.clientWidth` not `window.innerWidth` (avoids scrollbar width issue)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/FloatingEmojis.tsx` | **Create** — component + hook |
| `src/App.tsx` | **Modify** — add `<FloatingEmojis />` to background |
| `src/components/Editor.tsx` | **Modify** — add spinning emoji to button |
| `src/index.css` | **Modify** — add `@keyframes` + `prefers-reduced-motion` rules |
