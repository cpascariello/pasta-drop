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

## Decision #12 - 2026-02-03
**Context:** Aleph SDK v1.x `createStore()` fails with the current Aleph API due to signing and message-formatting issues
**Decision:** Bypass the Aleph SDK's `createStore` entirely. Build the store message manually, sign with the SDK's `ETHAccount`, and POST FormData directly to the API.
**Rationale:** The SDK's `createStore` had multiple incompatibilities: the `sign()` method requires a `getVerificationBuffer()` method on the message object (returning `Buffer.from([chain, sender, type, item_hash].join('\n'))`), and the `add_file` endpoint expects `item_type: 'inline'` with `item_content` containing store metadata JSON. Rather than patching the SDK, we construct the message manually and only use the SDK for `ETHAccount` wallet wrapping and signing.
**Alternatives considered:** Patching the SDK locally (fragile, maintenance burden), downgrading to an older API endpoint (none available), using POST message type instead of STORE (wrong semantics for file storage)

## Decision #13 - 2026-02-03
**Context:** Choosing which Aleph API server to use for write operations
**Decision:** Use `api2.aleph.im` instead of the SDK default `api3.aleph.im`
**Rationale:** `api3.aleph.im` consistently returns 422 for store uploads even with correctly formed messages. `api2.aleph.im` accepts them. Both are official Aleph gateways.
**Alternatives considered:** api3.aleph.im (SDK default, returns 422), api1.aleph.im (not tested)

## Decision #14 - 2026-02-03
**Context:** Users attempting to store data without ALEPH tokens get a cryptic API error
**Decision:** Add a pre-flight ERC-20 balance check before attempting the store operation
**Rationale:** Aleph storage requires holding ALEPH tokens (3 MB per token held). Checking the balance upfront with a raw `eth_call` to the ALEPH token contract (`balanceOf`) gives a clear error message instead of a confusing API failure. The check uses the token contract at `0x27702a26126e0b3702af63ee09ac4d1a084ef628`.
**Alternatives considered:** Let the API fail and parse the error (poor UX), check balance server-side (adds complexity)

## Decision #15 - 2026-02-03
**Context:** Adding Solana wallet support alongside Ethereum
**Decision:** Parallel provider stacks (wagmi + Solana wallet adapter) with separate write modules per chain, dynamically imported
**Rationale:** The Aleph SDK already supports Solana via `@aleph-sdk/solana`. Keeping the signing paths in separate modules (`aleph-write.ts` for ETH, `aleph-write-sol.ts` for SOL) maintains code splitting — Solana SDK is only loaded when a Solana wallet creates a paste. Both paths share the same manual message construction pattern.
**Alternatives considered:** Single unified write module (rejected — would bundle both SDKs together), Solana-only app (rejected — Ethereum is the primary Aleph chain)

## Decision #18 - 2026-02-04
**Context:** Ethereum used WalletConnect modal but Solana hardcoded Phantom wallet selection — inconsistent UX
**Decision:** Replace `@web3modal/wagmi` + `@solana/wallet-adapter-react` with Reown AppKit (`@reown/appkit` + `@reown/appkit-adapter-wagmi` + `@reown/appkit-adapter-solana`) for a single unified wallet modal
**Rationale:** Reown AppKit (successor to Web3Modal) provides a single modal supporting both EVM and Solana chains. Users get one "Connect Wallet" button that lets them pick any wallet on either chain. The Solana signing path uses a thin adapter to bridge AppKit's provider to Aleph SDK's `MessageSigner` interface. Wagmi hooks still work under AppKit's WagmiAdapter for the Ethereum path.
**Alternatives considered:** Keep separate modals (inconsistent UX), build custom Solana wallet picker (reinventing the wheel)

## Decision #19 - 2026-02-04
**Context:** Aleph API returns HTTP 422 with `{"status": "success", "hash": "..."}` for successful Solana store operations
**Decision:** Check response JSON body status instead of only HTTP status code
**Rationale:** The Aleph `api2.aleph.im` endpoint returns 422 for some successful operations. Checking `result.status === 'success'` in the response body is more reliable than `response.ok`. Applied to both ETH and SOL write paths for consistency.
**Alternatives considered:** Ignore HTTP status entirely (too permissive), switch API server (api3 has worse issues)

## Decision #16 - 2026-02-03
**Context:** Users need to find their past pastes
**Decision:** localStorage-based per-wallet history with `#my-pasta` route
**Rationale:** Aleph doesn't provide a built-in "list messages by sender" query that's fast enough for UX. Storing lightweight metadata (hash, preview, timestamp) in localStorage keyed by `{chain}:{address}` is instant and works offline. 50-entry cap prevents unbounded growth. Delete only removes local metadata — pastes remain on Aleph (they're immutable anyway).
**Alternatives considered:** Query Aleph indexer for sender's messages (slow, requires additional API), server-side database (defeats decentralized purpose)

## Decision #17 - 2026-02-03
**Context:** Background animation felt too static
**Decision:** Slow 120-second oklch hue cycling on the page background using CSS `@property`
**Rationale:** `@property --bg-hue` registers a custom property as `<number>`, making it animatable with CSS keyframes. The 120s duration is barely perceptible — gives a living feel without distraction. Separate keyframes for dark mode (lower chroma). `prefers-reduced-motion` disables it entirely.
**Alternatives considered:** JavaScript-driven color transitions (unnecessary overhead), faster cycling (too distracting)
