// src/App.tsx

import { useEffect, useState } from 'react';
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { Editor } from '@/components/Editor';
import { Viewer } from '@/components/Viewer';
import { PastaHistory } from '@/components/PastaHistory';
import { FloatingEmojis } from '@/components/FloatingEmojis';
import { Button } from '@/components/ui/button';

/** Extract chain and address from a CAIP-10 address string. */
function parseCaip(caipAddress: string | undefined): { chain: 'ETH' | 'SOL' | null; address: string | null } {
  if (!caipAddress) return { chain: null, address: null };
  if (caipAddress.startsWith('eip155:')) {
    // eip155:1:0xABC...
    const address = caipAddress.split(':')[2] ?? null;
    return { chain: 'ETH', address };
  }
  if (caipAddress.startsWith('solana:')) {
    // solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:ABC...
    const address = caipAddress.split(':')[2] ?? null;
    return { chain: 'SOL', address };
  }
  return { chain: null, address: null };
}

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

  // Navigate to a paste from history
  const handleViewPaste = (pasteHash: string) => {
    window.location.hash = pasteHash;
  };

  // Unified wallet state from AppKit
  const { isConnected, caipAddress, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const { chain: activeChain } = parseCaip(caipAddress);
  const activeAddress = address ?? null;

  // Truncated address for display
  const displayAddress = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : null;

  // Hash-based routing: #my-pasta = history, #<hash> = viewer, empty = editor
  const showHistory = hash === 'my-pasta';
  const showViewer = hash && !showHistory;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <FloatingEmojis />

      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!isConnected}
          onClick={() => { window.location.hash = 'my-pasta'; }}
        >
          My Pasta
        </Button>
        {isConnected && displayAddress && (
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            {displayAddress} ✕
          </Button>
        )}
      </div>

      <header className="mt-8 mb-10 text-center relative z-10">
        <h1 className="text-9xl mb-3 -translate-x-16 -rotate-2" style={{ fontFamily: '"Erica One", cursive' }}>Pasta Drop</h1>
        <p className="text-xl text-foreground font-bold translate-x-16 rotate-2">
          Your pasta, al dente forever.
        </p>
      </header>

      <main className="relative z-10 w-full flex justify-center">
        {showHistory && activeChain && activeAddress ? (
          <PastaHistory
            key="history"
            chain={activeChain}
            address={activeAddress}
            onViewPaste={handleViewPaste}
            onNewPaste={handleNewPaste}
          />
        ) : showViewer ? (
          <Viewer key={hash} hash={hash} onNewPaste={handleNewPaste} />
        ) : (
          <Editor key="editor" onPasteCreated={handlePasteCreated} />
        )}
      </main>

      <footer className="mt-auto pt-8 pb-4 text-xs text-muted-foreground/60 relative z-10 flex gap-2">
        <span>
          Powered by{' '}
          <a
            href="https://aleph.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted-foreground"
          >
            Aleph Cloud
          </a>
        </span>
        <span>·</span>
        <a
          href="https://github.com/cpascariello/pasta-drop"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
