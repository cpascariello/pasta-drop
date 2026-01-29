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
