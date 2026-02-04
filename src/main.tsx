// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { wagmiConfig, queryClient } from './config/wagmi';
import { SOLANA_ENDPOINT } from './config/solana';
import App from './App';
import './index.css';

// Polyfill Buffer for browser
import { Buffer } from 'buffer';
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={SOLANA_ENDPOINT}>
          <SolanaWalletProvider wallets={[]} autoConnect>
            <App />
          </SolanaWalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
