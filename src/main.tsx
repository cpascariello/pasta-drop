// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient } from './config/appkit';
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
