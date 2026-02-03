// src/App.tsx

import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Editor } from '@/components/Editor';
import { Viewer } from '@/components/Viewer';
import { FloatingEmojis } from '@/components/FloatingEmojis';
import { Button } from '@/components/ui/button';

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

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <FloatingEmojis />

      {isConnected && (
        <div className="fixed top-4 right-4 z-20">
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </Button>
        </div>
      )}

      <header className="mt-8 mb-10 text-center relative z-10">
        <h1 className="text-9xl mb-3 -translate-x-16 -rotate-2" style={{ fontFamily: '"Erica One", cursive' }}>Pasta Drop</h1>
        <p className="text-xl text-foreground font-bold translate-x-16 rotate-2">
          Your pasta, al dente forever.
        </p>
      </header>

      <main className="relative z-10 w-full flex justify-center">
        {hash ? (
          <Viewer hash={hash} onNewPaste={handleNewPaste} />
        ) : (
          <Editor onPasteCreated={handlePasteCreated} />
        )}
      </main>

      <footer className="mt-auto pt-8 pb-4 text-xs text-muted-foreground/60 relative z-10">
        Powered by{' '}
        <a
          href="https://aleph.cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground"
        >
          Aleph Cloud
        </a>
      </footer>
    </div>
  );
}

export default App;
