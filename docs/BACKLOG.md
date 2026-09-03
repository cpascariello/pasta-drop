# Backlog

Ideas and scope creep captured for later consideration, triaged by readiness.

---

## Workstreams

Every entry carries a `**Workstream:**` field naming a row in this registry.
The sync-up's **Backlog frontier** renders one row per workstream (see
CLAUDE.md Context Recovery), so the registry is what makes the backlog
groupable and its dependencies renderable.

A workstream is a **goal, not a category** — name it after the outcome it
drives toward. Add a row when a brainstorm/feature/phase/wave doesn't fit an
existing one; retire a row when its goal ships. Items that straddle two
workstreams get one home: the goal they gate.

| Workstream | Goal |
|------------|------|
| Pasta Drop | Keep the paste app shipping on Aleph Cloud: storage reliability, wallet UX, and polish |

---

## How Items Get Here

- Scope drift detected during focused work (active interrupt)
- Ideas that come up but aren't current priority
- "We should also..." moments
- Features identified but deferred

New entries land in one of the three live sections below. When unsure, default
to **Needs planning** — it's cheaper to demote a too-fuzzy item than to ship a
half-baked one from **Ready to execute**. As entries get refined or
deprioritized, move them between sections (Roadmap → Needs planning → Ready to
execute → Completed).

**Close-out rule:** marking an item DONE requires extracting any open
follow-ups named in its body (or in a results file it points to) into their
own live entries first — a DONE heading buries everything under it, and
sync-up reads status from headings only.

---

## Ready to execute

Scope is clear, no open questions, can be picked up in a single sitting. Small
to medium size (one PR, one focused session). The "if I have an hour, what can
I knock out" bucket. Each entry should already encode the answer to "how do I
do this" — if it doesn't, it belongs in **Needs planning**.

<!-- Items added here when ready for a focused execution session -->

### 2026-09-03 - Fix `react-refresh/only-export-components` lint error in button.tsx
**Workstream:** Pasta Drop
**Source:** Identified while shipping the template bootstrap (`npm run lint` red on main)
**Description:** `src/components/ui/button.tsx:56` exports `buttonVariants` alongside the `Button` component. Move `buttonVariants` to `src/components/ui/button-variants.ts` and import it in `button.tsx`, or add an eslint-disable with justification. Goal: `npm run lint` clean so it can gate ships.
**Priority:** Medium

---

## Needs planning

Intent is agreed but there are open questions, design choices, or multi-step
coordination required. Needs a brainstorm or spec before someone can execute.
Multi-day / multi-PR work. Default landing spot for new entries when the path
forward isn't obvious yet.

<!-- Items added here when scope is agreed but the approach isn't -->

---

## Roadmap ideations

Forward-looking ideas, possibly tied to a longer-form evolution doc
(`docs/<topic>-evolution.md`). Not actionable yet; captured so they're not
lost. Might never ship in current form, or might mature into a **Needs
planning** entry once the surrounding context lands.

<!-- Items added here when an idea is worth remembering but isn't on deck -->

---

## Completed

<details>
<summary>Archived items</summary>

### 2026-02-03 - Move Connect Wallet Button ✓
Completed in layout cleanup commit. Wallet button moved to fixed top-right of viewport, shown only when connected.

### 2026-01-29 - Flavor Chooser / Randomizer ✗
Dropped — low value for the effort. Single pasta personality works fine.

### 2026-02-03 - Floating Title Animation ✗
Dropped — title already has Erica One font + tilt. Adding motion would feel busy.

### 2026-02-03 - Textarea Focus Animation ✓
Completed in performance + polish pass. Subtle glow + scale(1.005) on focus via CSS transition.

### 2026-02-03 - Success Celebration Burst ✓
Completed in performance + polish pass. Portal-based emoji confetti burst from button on paste creation.

### 2026-02-03 - Copy Button Feedback Animation ✓
Completed in performance + polish pass. Squish-overshoot-settle bounce on Mangia! click via CSS keyframes.

### 2026-02-03 - Card Entrance Animation ✓
Completed in performance + polish pass. Fade + slide-up (800ms expo-out) on mount, retriggered on view switches via React keys.

### 2026-02-03 - Code Splitting for Web3 Libraries ✓
Completed in performance + polish pass. Split aleph.ts into read/write, manual chunks in Vite. Main chunk: 3,608 KB → 224 KB.

### 2026-02-03 - Hash Link to Aleph Explorer ✓
Completed. Viewer hash display links to `explorer.aleph.cloud/address/{chain}/{sender}/message/STORE/{itemHash}` when metadata is available, falls back to gateway raw URL for shared links.

### 2026-02-03 - Mobile Touch Repulsion for Floating Emojis ✓
Completed. Added `touchmove`/`touchend` handlers with `{ passive: true }` to FloatingEmojis.

### 2026-02-03 - Slow Gradient Background Shift ✓
Completed. `@property --bg-hue` with 120s oklch hue cycling animation. Separate dark mode keyframes. Respects `prefers-reduced-motion`.

### 2026-02-03 - Elaborate Aleph-Focused Inline Comments ✓
Completed. Expanded comments in `aleph-write.ts`, `aleph.ts`, `Editor.tsx`. Added "How Aleph Storage Works" section to README.

### 2026-02-03 - Solana Wallet Support ✓
Completed. Added `@solana/wallet-adapter-react` + `@aleph-sdk/solana`. New `aleph-write-sol.ts` signing path. Dual wallet UI in App/Editor.

### 2026-02-03 - My Pasta + Save/Share Separation ✓
Completed. localStorage-based history per wallet. `PastaHistory` component with view/share/delete. `#my-pasta` route.

</details>
