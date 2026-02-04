// src/config/wagmi.ts

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';

export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

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
  themeMode: 'light',
});
