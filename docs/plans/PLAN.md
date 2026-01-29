# Pasta Drop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Branding Reference:** See `2026-01-29-pasta-drop-branding.md` for full microcopy guide.

**Goal:** Build Pasta Drop — a decentralized pastebin where users paste text, sign with their wallet, and get a permanent link anyone can view without a wallet.

**Architecture:** Single-page React app with hash-based routing. No hash = editor view, hash present = viewer view. Writes use Aleph SDK's `createStore()`, reads fetch directly from the Aleph gateway URL. WalletConnect handles Ethereum and Solana connections.

**Tech Stack:** Vite, React, TypeScript, ShadCN/ui, Tailwind CSS, WalletConnect, Aleph SDK (`@aleph-sdk/client`, `@aleph-sdk/ethereum`, `@aleph-sdk/evm`, `@aleph-sdk/solana`), ethers v5

---

## Task 1: Scaffold Project

**Files:**
- Create: `/Users/dio/Library/CloudStorage/Dropbox/Claudio/repos/pasta-drop/` (entire project)

**Step 1: Create project directory and scaffold Vite**

```bash
cd /Users/dio/Library/CloudStorage/Dropbox/Claudio/repos
npm create vite@latest pasta-drop -- --template react-ts
cd pasta-drop
```

**Step 2: Initialize git**

```bash
git init
git add .
git commit -m "chore: scaffold Vite React TypeScript project"
```

**Step 3: Run dev server to verify scaffold works**

```bash
npm install
npm run dev
```

Expected: App runs on localhost:5173 with Vite + React default page

**Step 4: Commit working scaffold**

```bash
git add .
git commit -m "chore: install dependencies and verify scaffold"
```

---

## Task 2: Install and Configure Tailwind CSS

**Files:**
- Modify: `package.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Modify: `src/index.css`

**Step 1: Install Tailwind and dependencies**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 2: Configure tailwind.config.js**

Replace content of `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 3: Replace src/index.css with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Test Tailwind is working**

Modify `src/App.tsx` temporarily:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Tailwind Works!</h1>
    </div>
  )
}

export default App
```

Run `npm run dev` and verify dark background with white centered text.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Tailwind CSS"
```

---

## Task 3: Install and Configure ShadCN/ui

**Files:**
- Modify: `package.json`
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `tailwind.config.js`
- Modify: `tsconfig.json`

**Step 1: Install ShadCN dependencies**

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node
```

**Step 2: Add path alias to tsconfig.json**

Update `tsconfig.json` compilerOptions:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 3: Update vite.config.ts for path alias**

```ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Step 4: Create src/lib/utils.ts**

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 5: Create components.json for ShadCN**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Step 6: Update tailwind.config.js for ShadCN**

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
    },
  },
  plugins: [],
}
```

**Step 7: Add CSS variables to src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: configure ShadCN/ui"
```

---

## Task 4: Add ShadCN Components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/textarea.tsx`

**Step 1: Add Button component**

```bash
npx shadcn@latest add button
```

**Step 2: Add Card component**

```bash
npx shadcn@latest add card
```

**Step 3: Add Textarea component**

```bash
npx shadcn@latest add textarea
```

**Step 4: Verify components exist**

Check that `src/components/ui/` contains `button.tsx`, `card.tsx`, `textarea.tsx`

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add ShadCN Button, Card, Textarea components"
```

---

## Task 5: Install Aleph SDK and Wallet Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Aleph SDK packages**

```bash
npm install @aleph-sdk/client @aleph-sdk/ethereum @aleph-sdk/evm @aleph-sdk/solana
```

**Step 2: Install ethers v5 (aliased)**

```bash
npm install ethers5@npm:ethers@^5.7.2
```

**Step 3: Install WalletConnect packages**

```bash
npm install @web3modal/wagmi wagmi viem @tanstack/react-query
```

**Step 4: Install buffer polyfill for browser**

```bash
npm install buffer
```

**Step 5: Verify installation**

```bash
npm run dev
```

App should still run without errors.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: install Aleph SDK and wallet dependencies"
```

---

## Task 6: Create Aleph Configuration

**Files:**
- Create: `src/config/aleph.ts`

**Step 1: Create config directory and file**

```ts
// src/config/aleph.ts

/**
 * Channel identifier for organizing data on Aleph.
 * All pastes from this app are grouped under this channel.
 */
export const ALEPH_CHANNEL = 'PASTA_DROP';

/**
 * Ethereum Mainnet chain ID in hex format.
 * Required for signing with Ethereum wallets.
 */
export const ETH_MAINNET_CHAIN_ID = '0x1';

/**
 * Aleph gateway URL for fetching stored files.
 * Files are accessible at: {ALEPH_GATEWAY}/storage/raw/{hash}
 */
export const ALEPH_GATEWAY = 'https://api2.aleph.im/api/v0';
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Aleph configuration"
```

---

## Task 7: Create Aleph Service Layer

**Files:**
- Create: `src/services/aleph.ts`

**Step 1: Create the service file**

```ts
// src/services/aleph.ts

import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { ETHAccount } from '@aleph-sdk/ethereum';
import { JsonRPCWallet } from '@aleph-sdk/evm';
import { providers } from 'ethers5';
import { ALEPH_CHANNEL, ETH_MAINNET_CHAIN_ID, ALEPH_GATEWAY } from '../config/aleph';

/**
 * Error thrown when user is on wrong chain
 */
export class WrongChainError extends Error {
  constructor() {
    super("Pasta's burning! Switch to Ethereum mainnet.");
    this.name = 'WrongChainError';
  }
}

/**
 * Provider interface for wallet interactions
 */
interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

/**
 * Create a paste and store it on Aleph network.
 * Returns the content hash that can be used to retrieve the paste.
 *
 * @param provider - Wallet provider (e.g., from WalletConnect)
 * @param text - The text content to store
 * @returns The content hash (item_hash) of the stored paste
 */
export async function createPaste(
  provider: WalletProvider,
  text: string
): Promise<string> {
  // Step 1: Verify user is on mainnet
  const chainId = await provider.request({ method: 'eth_chainId' }) as string;
  if (chainId !== ETH_MAINNET_CHAIN_ID) {
    throw new WrongChainError();
  }

  // Step 2: Wrap provider with ethers5
  const web3Provider = new providers.Web3Provider(provider as providers.ExternalProvider);

  // Step 3: Create Aleph wallet wrapper
  const wallet = new JsonRPCWallet(web3Provider);
  await wallet.connect();

  if (!wallet.address) {
    throw new Error('Failed to get wallet address');
  }

  // Step 4: Create Ethereum account for signing
  const account = new ETHAccount(wallet, wallet.address);

  // Step 5: Create authenticated client
  const client = new AuthenticatedAlephHttpClient(account);

  // Step 6: Convert text to Blob/File for storage
  const blob = new Blob([text], { type: 'text/plain' });
  const file = new File([blob], 'pasta.txt', { type: 'text/plain' });

  // Step 7: Store the file (triggers signature popup)
  const result = await client.createStore({
    fileObject: file,
    channel: ALEPH_CHANNEL,
    sync: true,
  });

  return result.item_hash;
}

/**
 * Fetch a paste by its content hash.
 * This is a READ operation - no wallet needed.
 *
 * @param hash - The content hash returned from createPaste
 * @returns The text content of the paste
 */
export async function fetchPaste(hash: string): Promise<string> {
  const url = `${ALEPH_GATEWAY}/storage/raw/${hash}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Kitchen's closed. Try again later.");
  }

  return response.text();
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Aleph service layer for paste creation and retrieval"
```

---

## Task 8: Setup WalletConnect Configuration

**Files:**
- Create: `src/config/wagmi.ts`
- Modify: `src/main.tsx`

**Step 1: Create wagmi configuration**

```ts
// src/config/wagmi.ts

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';

// Get a project ID from https://cloud.walletconnect.com
// For demo purposes, use a placeholder - users should replace with their own
export const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

const metadata = {
  name: 'Pasta Drop',
  description: 'Your pasta, al dente forever.',
  url: 'https://pastadrop.example.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

export const queryClient = new QueryClient();

createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
});
```

**Step 2: Update main.tsx with providers**

```tsx
// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient } from './config/wagmi';
import App from './App';
import './index.css';

// Polyfill Buffer for browser
import { Buffer } from 'buffer';
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
```

**Step 3: Add Buffer to window type**

Create `src/vite-env.d.ts` or update if exists:

```ts
/// <reference types="vite/client" />

interface Window {
  Buffer: typeof import('buffer').Buffer;
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: setup WalletConnect with wagmi"
```

---

## Task 9: Build Editor View Component

**Files:**
- Create: `src/components/Editor.tsx`

**Step 1: Create Editor component**

```tsx
// src/components/Editor.tsx

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPaste, WrongChainError } from '@/services/aleph';

interface EditorProps {
  onPasteCreated: (hash: string) => void;
}

export function Editor({ onPasteCreated }: EditorProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const { address, isConnected, connector } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  const handleCreate = async () => {
    if (!text.trim()) {
      setError("Can't serve an empty plate.");
      return;
    }

    if (!connector) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus('Al dente...');

    try {
      const provider = await connector.getProvider();
      const hash = await createPaste(provider, text);
      setStatus('A tavola!');
      // Brief pause to show success state
      await new Promise(resolve => setTimeout(resolve, 500));
      onPasteCreated(hash);
    } catch (err) {
      setStatus(null);
      if (err instanceof WrongChainError) {
        setError("Pasta's burning! Switch to Ethereum mainnet.");
      } else if (err instanceof Error) {
        // Check for user rejection
        if (err.message.includes('rejected') || err.message.includes('denied')) {
          setError('Chef walked out. Try again?');
        } else {
          setError(err.message);
        }
      } else {
        setError("Kitchen's closed. Try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>New Pasta</span>
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={() => disconnect()}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => open()}>
              Connect Wallet
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Drop your pasta here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px] font-mono"
          disabled={isLoading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        {status && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{status}</p>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button
            onClick={handleCreate}
            disabled={isLoading || !text.trim()}
            className="w-full"
          >
            {isLoading ? status || 'Al dente...' : 'Al dente'}
          </Button>
        ) : (
          <Button onClick={() => open()} className="w-full">
            Connect Wallet to Drop Pasta
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Editor component with Pasta Drop branding"
```

---

## Task 10: Build Viewer Component

**Files:**
- Create: `src/components/Viewer.tsx`

**Step 1: Create Viewer component**

```tsx
// src/components/Viewer.tsx

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchPaste } from '@/services/aleph';

interface ViewerProps {
  hash: string;
  onNewPaste: () => void;
}

export function Viewer({ hash, onNewPaste }: ViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetchPaste(hash)
      .then(setContent)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Kitchen's closed. Try again later.");
      })
      .finally(() => setIsLoading(false));
  }, [hash]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Buon appetito!</span>
          <span className="text-sm font-mono text-muted-foreground">
            {hash.slice(0, 8)}...{hash.slice(-8)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <span className="text-muted-foreground">Al dente...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <span className="text-red-500">{error}</span>
          </div>
        ) : (
          <pre className="min-h-[300px] p-4 bg-muted rounded-md overflow-auto font-mono text-sm whitespace-pre-wrap">
            {content}
          </pre>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={copyLink} className="flex-1">
          {copied ? 'Perfetto!' : 'Mangia!'}
        </Button>
        <Button onClick={onNewPaste} className="flex-1">
          Cook your own
        </Button>
      </CardFooter>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Viewer component with Pasta Drop branding"
```

---

## Task 11: Implement Hash-Based Routing in App

**Files:**
- Modify: `src/App.tsx`

**Step 1: Replace App.tsx with routing logic**

```tsx
// src/App.tsx

import { useEffect, useState } from 'react';
import { Editor } from '@/components/Editor';
import { Viewer } from '@/components/Viewer';

function App() {
  const [hash, setHash] = useState<string | null>(null);

  // Read hash from URL on mount and on hash change
  useEffect(() => {
    const readHash = () => {
      const urlHash = window.location.hash.slice(1); // Remove the #
      setHash(urlHash || null);
    };

    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  // Navigate to paste after creation
  const handlePasteCreated = (newHash: string) => {
    window.location.hash = newHash;
  };

  // Navigate back to editor
  const handleNewPaste = () => {
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Pasta Drop</h1>
        <p className="text-muted-foreground">
          Your pasta, al dente forever.
        </p>
      </header>

      <main>
        {hash ? (
          <Viewer hash={hash} onNewPaste={handleNewPaste} />
        ) : (
          <Editor onPasteCreated={handlePasteCreated} />
        )}
      </main>

      <footer className="mt-8 text-sm text-muted-foreground">
        Powered by{' '}
        <a
          href="https://aleph.im"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Aleph Cloud
        </a>
      </footer>
    </div>
  );
}

export default App;
```

**Step 2: Test the flow**

```bash
npm run dev
```

- Visit localhost:5173 → see Editor
- Connect wallet, enter text, click "Al dente" → URL changes to `#<hash>`
- Refresh page → Viewer loads with "Buon appetito!"
- Click "Cook your own" → back to Editor

**Step 3: Commit**

```bash
git add .
git commit -m "feat: implement hash-based routing between Editor and Viewer"
```

---

## Task 12: Add Dark Mode by Default

**Files:**
- Modify: `index.html`

**Step 1: Add dark class to html element**

Update `index.html`:

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pasta Drop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: enable dark mode by default"
```

---

## Task 13: Create README

**Files:**
- Create: `README.md`

**Step 1: Write README**

```markdown
# Pasta Drop 🍝

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
```

**Step 2: Commit**

```bash
git add .
git commit -m "docs: add README"
```

---

## Task 14: Create BACKLOG

**Files:**
- Create: `BACKLOG.md`

**Step 1: Write BACKLOG with future features**

```markdown
# Backlog

Ideas and features for future versions.

---

## Flavor Chooser / Randomizer

Let users pick a "flavor" theme or randomize it. Different food puns for different pastes.

**Source:** Brainstorming session, 2026-01-29

---

## My Pasta + Save/Share Separation

Add a "My Pasta" history view per wallet. Separate save (private) vs share (public link) actions. Delete option from history.

**Source:** Brainstorming session, 2026-01-29
```

**Step 2: Commit**

```bash
git add .
git commit -m "docs: add BACKLOG with future feature ideas"
```

---

## Task 15: Build and Test Production Build

**Files:**
- None (verification only)

**Step 1: Build for production**

```bash
npm run build
```

Expected: Build completes without errors, outputs to `dist/`

**Step 2: Preview production build**

```bash
npm run preview
```

Visit the preview URL and test:
- Editor loads with "Pasta Drop" title
- "Al dente" button visible
- Wallet connects
- (If you have mainnet wallet) Create a paste and verify "A tavola!" appears
- Direct URL with hash loads the viewer with "Buon appetito!"

**Step 3: Commit any fixes if needed**

---

## Task 16: Final Cleanup and Tag

**Files:**
- Remove: `src/App.css` (unused)
- Remove: `src/assets/react.svg` (unused)
- Update: `public/vite.svg` (optional: replace with pasta icon)

**Step 1: Remove unused files**

```bash
rm src/App.css
rm -rf src/assets
```

**Step 2: Commit cleanup**

```bash
git add .
git commit -m "chore: remove unused scaffold files"
```

**Step 3: Create initial release tag**

```bash
git tag -a v0.1.0 -m "Initial release: Pasta Drop - Your pasta, al dente forever"
```

---

## Summary

After completing all tasks, the repo contains:

```
pasta-drop/
├── src/
│   ├── components/
│   │   ├── ui/          # ShadCN components
│   │   ├── Editor.tsx   # "Al dente" creation view
│   │   └── Viewer.tsx   # "Buon appetito!" viewing view
│   ├── config/
│   │   ├── aleph.ts     # Aleph constants
│   │   └── wagmi.ts     # WalletConnect config
│   ├── services/
│   │   └── aleph.ts     # createPaste, fetchPaste
│   ├── lib/
│   │   └── utils.ts     # ShadCN utilities
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point with providers
│   └── index.css        # Tailwind + ShadCN styles
├── index.html
├── tailwind.config.js
├── components.json
├── package.json
├── README.md
└── BACKLOG.md
```

**Branding reference:** See `2026-01-29-pasta-drop-branding.md` for full microcopy guide.

**Next step**: Deploy to a static host (Vercel, Netlify, or Aleph web hosting) and add the live URL to the cookbook documentation.
