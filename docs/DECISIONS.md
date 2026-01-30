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
