// src/config/appkit.ts
// Unified wallet modal config — supports Ethereum + Solana via Reown AppKit.

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import type { AppKitNetwork } from '@reown/appkit/networks';

export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

const metadata = {
  name: 'Pasta Drop',
  description: 'Your pasta, al dente forever.',
  url: 'https://pastadrop.stasho.xyz',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, solana];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

const solanaAdapter = new SolanaAdapter();

createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks,
  projectId,
  metadata,
  features: { analytics: false },
  themeMode: 'light',
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
export const queryClient = new QueryClient();
