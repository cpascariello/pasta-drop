# Pasta Drop

Your pasta, al dente forever.

Decentralized text sharing powered by Aleph Cloud. No account, no server, no expiration.

## Features

- **Permanent storage** — Your pasta is stored on the Aleph network forever
- **No backend** — The app is entirely client-side
- **Wallet auth** — Sign with your Ethereum wallet to drop pasta
- **Free reads** — Anyone can view pasta without connecting a wallet

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Configuration

Before deploying, update the WalletConnect project ID in `src/config/wagmi.ts`:

```ts
export const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';
```

Get a project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com).

## How It Works

1. **Drop** — Enter text, connect your Ethereum wallet, click "Al dente"
2. **Store** — Your pasta is stored on Aleph Cloud as an immutable Store object
3. **Share** — Click "Mangia!" to copy the permanent link
4. **Serve** — Anyone can open the link — no wallet needed. Buon appetito!

## How Aleph Storage Works

[Aleph Cloud](https://aleph.cloud) is a decentralized storage and compute network. Here's how Pasta Drop uses it:

### Content-Addressable Storage

Files on Aleph are identified by their SHA-256 hash. The hash **is** the address — there's no database, no IDs, no filenames. If you know the hash, you can retrieve the file from any Aleph gateway:

```
https://api2.aleph.im/api/v0/storage/raw/{sha256-hash}
```

### STORE Messages

To upload a file, you send a signed **STORE message** to an Aleph API node. The message has two layers:

1. **Outer message** — envelope with chain, sender, signature, and `item_content`
2. **Inner item_content** — JSON metadata pointing to the file hash

The outer `item_hash` is the SHA-256 of the `item_content` JSON string. The inner `item_content.item_hash` is the SHA-256 of the actual file bytes.

### Token-Based Storage

Aleph uses a hold-to-use model: each ALEPH token held on Ethereum mainnet grants ~3 MB of storage quota. Tokens are **not spent** — just held. The app checks your balance before uploading.

### Read vs Write Paths

| Path | Dependencies | Auth Required |
|------|-------------|---------------|
| **Read** (`aleph-read.ts`) | `fetch()` only | No |
| **Write** (`aleph-write.ts`) | Aleph SDK + ethers5 | Wallet signature |

The write path is loaded via dynamic `import()` only when the user creates a paste, keeping the initial bundle small.

### SDK Bypass

We bypass the Aleph SDK's `createStore()` and construct messages manually. This is due to compatibility issues between the SDK v1.x and the current API. See `docs/DECISIONS.md` for details.

## Microcopy

| Action | Text |
|--------|------|
| Create button | "Al dente" |
| Loading | "Al dente..." |
| Success | "A tavola!" |
| Copy link | "Mangia!" |
| Copied | "Perfetto!" |
| New paste | "Cook your own" |

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [ShadCN/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [Aleph SDK](https://docs.aleph.im/) — Decentralized storage
- [WalletConnect](https://walletconnect.com/) + [wagmi](https://wagmi.sh/) — Wallet connection

## License

MIT
