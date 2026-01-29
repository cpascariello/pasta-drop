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
