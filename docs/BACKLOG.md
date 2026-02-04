# Backlog

Ideas and scope creep captured for later consideration.

---

## How Items Get Here

- Scope drift detected during focused work (active interrupt)
- Ideas that come up but aren't current priority
- "We should also..." moments
- Features identified but deferred

---

## Open Items

_No open items._

---

## Completed / Rejected

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
