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
│   └── Viewer.tsx       # Paste viewing view
├── config/
│   ├── aleph.ts         # Aleph constants (channel, gateway, chain ID)
│   └── wagmi.ts         # WalletConnect/wagmi configuration
├── services/
│   └── aleph.ts         # createPaste(), fetchPaste() functions
├── lib/
│   └── utils.ts         # ShadCN cn() utility
├── App.tsx              # Hash-based routing
├── main.tsx             # Entry point with providers
└── index.css            # Tailwind v4 theme configuration
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
**Key files:** `src/services/aleph.ts`
**Notes:** Writes require wallet signature. Reads are public via `{ALEPH_GATEWAY}/storage/raw/{hash}`.

### Provider Wrapping for Aleph
**Date:** 2026-01-29
**Context:** Aleph SDK expects ethers v5 provider, wagmi provides generic provider
**Approach:** Cast wagmi provider to `WalletProvider` interface, wrap with `ethers5.providers.Web3Provider`, then wrap with `JsonRPCWallet` for Aleph.
**Key files:** `src/services/aleph.ts`, `src/components/Editor.tsx`
**Notes:** Requires `ethers5` alias in package.json to avoid conflicts with newer ethers versions.

### Tailwind v4 Theme
**Date:** 2026-01-29
**Context:** ShadCN/ui needs CSS variables for theming
**Approach:** Use `@theme` directive in index.css to define CSS custom properties that map to Tailwind utilities. Dark mode via `class="dark"` on `<html>`.
**Key files:** `src/index.css`, `index.html`
**Notes:** Tailwind v4 uses `@tailwindcss/postcss` plugin instead of direct PostCSS integration.
