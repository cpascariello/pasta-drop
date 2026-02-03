# Architecture

Technical patterns and decisions.

---

## Stack

- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS v4 + ShadCN/ui
- **Wallet:** WalletConnect v2 + wagmi + viem
- **Storage:** Aleph SDK (@aleph-sdk/client, @aleph-sdk/ethereum, @aleph-sdk/evm)
- **Ethereum:** ethers v5 (aliased as `ethers5`)

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # ShadCN components (Button, Card, Textarea)
│   ├── Editor.tsx       # Paste creation view
│   ├── Viewer.tsx       # Paste viewing view
│   ├── FloatingEmojis.tsx # Ambient floating spaghetti background
│   └── CelebrationBurst.tsx # One-shot emoji confetti burst (portal-based)
├── config/
│   ├── aleph.ts         # Aleph constants (channel, gateway, chain ID)
│   ├── wagmi.ts         # WalletConnect/wagmi configuration
│   ├── floatingEmojis.ts # Floating emoji tuning (counts, opacity, sizes, speed)
│   └── celebration.ts   # Celebration burst tuning (emojis, count, spread, duration)
├── services/
│   ├── aleph-read.ts    # fetchPaste() — lightweight, no heavy deps
│   └── aleph-write.ts   # createPaste() — pulls Aleph SDK + ethers5
├── lib/
│   └── utils.ts         # ShadCN cn() utility
├── App.tsx              # Hash-based routing
├── main.tsx             # Entry point with providers
└── index.css            # Tailwind v4 theme + animation keyframes
```

---

## Patterns

### Hash-Based Routing
**Date:** 2026-01-29
**Context:** Single-page app needs to show Editor or Viewer based on URL
**Approach:** Use `window.location.hash` for routing. No hash = Editor, hash present = Viewer showing paste at that hash.
**Key files:** `src/App.tsx`
**Notes:** Enables direct linking to pastes without a router library.

### Aleph Store Pattern
**Date:** 2026-01-29
**Context:** Need permanent, decentralized storage for paste content
**Approach:** Use Aleph `createStore()` with File objects. Content is stored as raw text, retrievable via gateway URL without authentication.
**Key files:** `src/services/aleph-write.ts`, `src/services/aleph-read.ts`
**Notes:** Writes require wallet signature. Reads are public via `{ALEPH_GATEWAY}/storage/raw/{hash}`. Read and write paths are split into separate modules for code splitting — the write path pulls in Aleph SDK + ethers5, while the read path uses only `fetch()`.

### Provider Wrapping for Aleph
**Date:** 2026-01-29
**Context:** Aleph SDK expects ethers v5 provider, wagmi provides generic provider
**Approach:** Cast wagmi provider to `WalletProvider` interface, wrap with `ethers5.providers.Web3Provider`, then wrap with `JsonRPCWallet` for Aleph.
**Key files:** `src/services/aleph-write.ts`, `src/components/Editor.tsx`
**Notes:** Requires `ethers5` alias in package.json to avoid conflicts with newer ethers versions.

### Floating Emoji Animation
**Date:** 2026-02-03
**Context:** Add personality to the single-component UI with ambient background animation
**Approach:** RAF-driven physics simulation with direct DOM mutation (bypasses React reconciliation). Emojis drift with sinusoidal modulation, wrap at viewport edges, and respond to mouse repulsion with inverse-square falloff. Button emoji uses CSS keyframes with multi-stop rotation.
**Key files:** `src/components/FloatingEmojis.tsx`, `src/config/floatingEmojis.ts`, `src/index.css`
**Notes:** All positions stored in refs, no React re-renders from animation. Respects `prefers-reduced-motion`. Pauses RAF when tab is hidden. Config file allows tuning counts, opacity, sizes, and speed without touching component code.

### Tailwind v4 Theme
**Date:** 2026-01-29
**Context:** ShadCN/ui needs CSS variables for theming
**Approach:** Use `@theme` directive in index.css to define CSS custom properties that map to Tailwind utilities. Dark mode via `class="dark"` on `<html>`.
**Key files:** `src/index.css`, `index.html`
**Notes:** Tailwind v4 uses `@tailwindcss/postcss` plugin instead of direct PostCSS integration.

### Code Splitting
**Date:** 2026-02-03
**Context:** Monolithic 3.6MB bundle with web3 libraries loaded eagerly
**Approach:** Three-pronged: (1) Split `aleph.ts` into `aleph-read.ts` (zero heavy deps) and `aleph-write.ts` (Aleph SDK + ethers5). (2) Dynamic `import()` for `createPaste` in Editor.tsx — only loaded when user actually creates a paste. (3) Manual chunks in `vite.config.ts` separating vendor-web3, vendor-aleph, and vendor-ui for independent caching.
**Key files:** `vite.config.ts`, `src/services/aleph-read.ts`, `src/services/aleph-write.ts`, `src/components/Editor.tsx`
**Notes:** Main chunk dropped from 3,608 KB → 224 KB. Viewer path never loads Aleph SDK. `type` imports from `aleph-write.ts` are erased at compile time (no runtime cost).

### UI Micro-Animations
**Date:** 2026-02-03
**Context:** Adding polish animations — card entrance, textarea focus, copy button bounce, celebration burst
**Approach:** Animation responsibilities stratified by type: CSS keyframes for one-shot feedback (card-entrance, button-bounce), CSS transitions for state-driven effects (textarea focus glow), imperative DOM + `createPortal` for transient particle effects (CelebrationBurst). All keyframes and animation classes live in `index.css`. Config constants extracted to `src/config/celebration.ts`.
**Key files:** `src/index.css`, `src/components/CelebrationBurst.tsx`, `src/config/celebration.ts`, `src/components/Editor.tsx`, `src/components/Viewer.tsx`
**Notes:** All animations respect `prefers-reduced-motion`. CelebrationBurst uses direct DOM manipulation (same pattern as FloatingEmojis) to avoid React reconciliation for transient particles. Bounce re-trigger uses React `key` prop to force remount. Timing vocabulary: 200ms (micro-interactions), 350-400ms (UI feedback), 700ms (spectacle).
