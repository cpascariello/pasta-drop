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
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  optimizeDeps: {
    force: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-web3': ['wagmi', 'viem', '@web3modal/wagmi', '@tanstack/react-query', 'ethers5', 'buffer'],
          'vendor-aleph': ['@aleph-sdk/client', '@aleph-sdk/ethereum', '@aleph-sdk/evm', '@aleph-sdk/solana'],
          'vendor-solana': ['@solana/web3.js', '@solana/wallet-adapter-react', '@solana/wallet-adapter-base'],
          'vendor-ui': ['react', 'react-dom'],
        },
      },
    },
  },
})
