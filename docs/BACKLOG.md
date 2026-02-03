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

### 2026-01-29 - My Pasta + Save/Share Separation
**Source:** Brainstorming session
**Description:** Add a "My Pasta" history view per wallet. Separate save (private) vs share (public link) actions. Delete option from history.
**Priority:** Medium

### 2026-01-29 - Solana Wallet Support
**Source:** Original plan (Aleph SDK supports Solana)
**Description:** Add Solana wallet connection alongside Ethereum. The Aleph SDK already supports `@aleph-sdk/solana`.
**Priority:** Low

### 2026-02-03 - Slow Gradient Background Shift
**Source:** Brainstorming spaghetti animations
**Description:** Very slow, barely perceptible background color cycling. Gives the page a living feel.
**Priority:** Low

### 2026-02-03 - Elaborate Aleph-Focused Inline Comments
**Source:** Cookbook documentation review
**Description:** Add detailed inline comments focused on teaching Aleph Cloud integration. Key areas: src/services/aleph-write.ts (expand Store vs POST explanation, link to Aleph SDK docs), src/config/aleph.ts (link to docs for channel/gateway concepts), src/components/Editor.tsx (explain wallet-to-Aleph handoff). Add a "How Aleph Storage Works" section to the README. Other tools (wagmi, React, physics) don't need additional commentary.
**Priority:** Medium

### 2026-02-03 - Mobile Touch Repulsion for Floating Emojis
**Source:** Code review feedback
**Description:** Add `touchmove` handler to FloatingEmojis so mobile users can interact with the repulsion effect (currently desktop-only via mousemove).
**Priority:** Low

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
Completed in performance + polish pass. Fade + slide-up (400ms expo-out) on mount.

### 2026-02-03 - Code Splitting for Web3 Libraries ✓
Completed in performance + polish pass. Split aleph.ts into read/write, manual chunks in Vite. Main chunk: 3,608 KB → 224 KB.

</details>
