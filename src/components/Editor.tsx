// src/components/Editor.tsx

import { useCallback, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CelebrationBurst } from '@/components/CelebrationBurst';
import type { WalletProvider } from '@/services/aleph-write';

interface EditorProps {
  onPasteCreated: (hash: string) => void;
}

export function Editor({ onPasteCreated }: EditorProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { isConnected, connector } = useAccount();
  const { open } = useWeb3Modal();

  const clearBurst = useCallback(() => setBurst(null), []);

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
      const provider = await connector.getProvider() as WalletProvider;
      const { createPaste } = await import('@/services/aleph-write');
      const hash = await createPaste(provider, text);
      setStatus('A tavola!');
      // Fire celebration burst from button center
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
      // Brief pause to show success state + burst
      await new Promise(resolve => setTimeout(resolve, 800));
      onPasteCreated(hash);
    } catch (err) {
      setStatus(null);
      const { WrongChainError } = await import('@/services/aleph-write');
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
    <Card className="w-full max-w-3xl card-entrance">
      <CardHeader>
        <CardTitle className="-rotate-1" style={{ fontFamily: '"Erica One", cursive' }}>New Pasta</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Drop your pasta here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[400px] font-mono pasta-textarea"
          disabled={isLoading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        {status && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{status}</p>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        {isConnected ? (
          <Button
            ref={buttonRef}
            onClick={handleCreate}
            disabled={isLoading || !text.trim()}
            className="-rotate-1"
            style={{ fontFamily: '"Erica One", cursive' }}
          >
            <span className={`text-lg ${isLoading ? 'pasta-spin-fast' : 'pasta-spin'}`}>🍝</span>
            {' '}
            {isLoading ? status || 'Al dente...' : 'Al dente'}
          </Button>
        ) : (
          <Button onClick={() => open()}>
            Connect Wallet to Drop Pasta
          </Button>
        )}
      </CardFooter>
      {burst && <CelebrationBurst origin={burst} onComplete={clearBurst} />}
    </Card>
  );
}
