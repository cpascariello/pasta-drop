# Decisions Log

Key decisions made during development. When you wonder "why did we do X?", the answer should be here.

---

## How Decisions Are Logged

Decisions are captured when these phrases appear:
- "decided" / "let's go with" / "rejected"
- "choosing X because" / "not doing X because"
- "actually, let's" / "changed my mind"

Each entry includes:
- Context (what we were working on)
- Decision (what was chosen)
- Rationale (why - the most important part)

---

## Decision #1 - 2026-01-29
**Context:** Choosing storage approach for decentralized paste content
**Decision:** Use Aleph `createStore()` with File objects instead of POST messages
**Rationale:** Store objects are designed for file-like content and provide direct raw access via gateway URL. POST messages are better for structured data queries.
**Alternatives considered:** Aleph POST messages, IPFS direct

## Decision #2 - 2026-01-29
**Context:** Handling ethers version conflicts between Aleph SDK and modern ecosystem
**Decision:** Install ethers v5 with npm alias (`ethers5@npm:ethers@^5.7.2`)
**Rationale:** Aleph SDK requires ethers v5 APIs. Aliasing avoids conflicts with wagmi/viem which use different patterns. Import as `ethers5` to make the version explicit.
**Alternatives considered:** Downgrade all deps to ethers v5, use viem directly with Aleph

## Decision #3 - 2026-01-29
**Context:** Routing approach for single-page paste app
**Decision:** Use hash-based routing (`window.location.hash`) instead of a router library
**Rationale:** Only two views (Editor/Viewer) with simple logic: no hash = Editor, hash = Viewer. Adding react-router would be overkill. Hash routing also works on static hosts without server configuration.
**Alternatives considered:** react-router, TanStack Router

## Decision #4 - 2026-01-29
**Context:** Tailwind v4 configuration for ShadCN/ui
**Decision:** Use `@theme` directive with CSS custom properties instead of traditional tailwind.config.js approach
**Rationale:** Tailwind v4 changed how PostCSS integration works. The `@theme` directive properly exposes CSS variables as Tailwind utilities. Traditional `@apply` with arbitrary values doesn't work the same way.
**Alternatives considered:** Downgrade to Tailwind v3

## Decision #5 - 2026-01-29
**Context:** Chain requirement for paste creation
**Decision:** Require Ethereum mainnet only (chain ID 0x1)
**Rationale:** Aleph network anchors data to Ethereum mainnet for security. Allowing testnets would create pastes with different trust guarantees. Users should be on mainnet for production use.
**Alternatives considered:** Support multiple chains, allow testnets for development

## Decision #6 - 2026-01-30
**Context:** Updating the app's visual theme
**Decision:** Switch to oklch-based color system with custom shadcn/ui v4 theme, using light mode as default
**Rationale:** oklch provides perceptually uniform colors. New palette features pink/red primary, teal secondary, warm accents, red-tinted hard-edge shadows, and larger border radius (1.25rem). Light mode set as default to showcase the new warm palette. Uses `@theme inline` directive matching shadcn/ui v4 convention.
**Alternatives considered:** Keep HSL-based theme with dark mode default

## Decision #7 - 2026-02-03
**Context:** Adding ambient background animation to the single-component UI
**Decision:** Floating spaghetti emojis with lava-lamp drift + edge wrapping (not bouncing), plus spinning emoji on the submit button
**Rationale:** Edge wrapping feels more ambient/lava-lamp. Bouncing reads as DVD screensaver. Mouse repulsion with inverse-square falloff adds interactive discovery. Button spin uses multi-stop keyframes to avoid ease-in-out stalling at 0/360 seam.
**Alternatives considered:** Spaghetti rain (constant falling), static scattered emojis with pulse, edge bouncing

## Decision #8 - 2026-02-03
**Context:** Animation implementation approach
**Decision:** RAF loop with direct DOM mutation via refs, no React state for positions
**Rationale:** Using useState for 25 emoji positions at 60fps would cause 60 React reconciliation cycles/sec. Direct DOM mutation bypasses React entirely for zero re-render overhead. Physics constants extracted to config file for easy tuning.
**Alternatives considered:** React state with useMemo, CSS-only animation, Framer Motion

## Decision #9 - 2026-02-03
**Context:** Typography choices for the app
**Decision:** Erica One for display text (title, card headers, submit button), Lato for body/UI text
**Rationale:** Erica One is rounded and playful, matching the pasta theme and tilted layout. Lato is clean and neutral, letting the display font be the personality without competing. Both loaded from Google Fonts.
**Alternatives considered:** Ultra (too conventional/newspaper-like), Inter (default, no character)

## Decision #10 - 2026-02-03
**Context:** Code splitting strategy for 3.6MB monolithic bundle
**Decision:** Split `aleph.ts` into read/write modules, dynamic `import()` for `createPaste`, manual chunks in Vite config (vendor-web3, vendor-aleph, vendor-ui)
**Rationale:** `fetchPaste` uses plain `fetch()` with zero heavy deps — it should not force loading Aleph SDK + ethers5 on the Viewer path. Manual chunks separate vendor libraries for independent caching. Main chunk went from 3,608 KB → 224 KB.
**Alternatives considered:** Lazy-loading entire Editor/Viewer components (rejected — wagmi hooks needed at App level), single dynamic import for all of aleph.ts (rejected — fetchPaste is too lightweight to bundle with write deps)

## Decision #11 - 2026-02-03
**Context:** UI micro-animation approach for card entrance, textarea focus, copy button bounce, and celebration burst
**Decision:** CSS keyframes/transitions for deterministic UI feedback, imperative DOM + portal for the celebration burst particle effect
**Rationale:** Animation responsibilities are stratified by complexity: CSS keyframes for one-shot feedback (card entrance, button bounce), CSS transitions for state-driven effects (textarea focus glow), imperative DOM for transient particle effects (burst). The burst uses `createPortal` to render above everything and self-cleans on completion. All animations respect `prefers-reduced-motion`. Timing vocabulary: 200ms micro-interactions, 350-400ms UI feedback, 700-800ms spectacle.
**Alternatives considered:** Framer Motion (too heavy for these effects), React state-driven particles (unnecessary reconciliation overhead for 10 transient elements)
