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
