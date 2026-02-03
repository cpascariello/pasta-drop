// src/components/Editor.tsx

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const mountedRef = useRef(true);

  const { isConnected, connector } = useAccount();
  const { open } = useWeb3Modal();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const clearBurst = useCallback(() => setBurst(null), []);

  // Wallet-to-Aleph handoff:
  // 1. wagmi's connector.getProvider() returns the raw EIP-1193 provider
  // 2. Dynamic import() loads aleph-write.ts only when needed (code splitting)
  // 3. createPaste() wraps the provider for Aleph, signs, and uploads
  // 4. On success, we get back a content hash for the viewer URL
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
      // Get the raw EIP-1193 provider from the connected wallet (MetaMask, etc.)
      const provider = await connector.getProvider() as WalletProvider;
      // Dynamic import keeps Aleph SDK + ethers5 out of the initial bundle.
      // Only loaded when the user actually creates a paste.
      const { createPaste, WrongChainError } = await import('@/services/aleph-write');
      try {
        const hash = await createPaste(provider, text);
        if (!mountedRef.current) return;
        setStatus('A tavola!');
        // Fire celebration burst from button center
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        }
        // Brief pause to show success state + burst
        await new Promise(resolve => setTimeout(resolve, 800));
        if (!mountedRef.current) return;
        onPasteCreated(hash);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        setStatus(null);
        // Log full error for debugging Aleph API issues
        console.error('[Pasta Drop] createPaste failed:', err);
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosErr = err as { response?: { status?: number; data?: unknown } };
          console.error('[Pasta Drop] Response status:', axiosErr.response?.status);
          console.error('[Pasta Drop] Response data:', axiosErr.response?.data);
        }
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
      }
    } catch {
      if (!mountedRef.current) return;
      setStatus(null);
      setError("Kitchen's closed. Try again later.");
    } finally {
      if (mountedRef.current) setIsLoading(false);
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
