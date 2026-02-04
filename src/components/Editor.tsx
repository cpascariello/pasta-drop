// src/components/Editor.tsx

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CelebrationBurst } from '@/components/CelebrationBurst';
import { addToHistory } from '@/services/pasta-history';
import { storeExplorerMeta } from '@/services/explorer-meta';
import type { WalletProvider, PasteResult } from '@/services/aleph-write';
import type { SolanaWallet } from '@/services/aleph-write-sol';

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

  // Ethereum wallet (wagmi)
  const { isConnected: ethConnected, connector } = useAccount();
  const { open: openEthModal } = useWeb3Modal();

  // Solana wallet
  const solWallet = useWallet();
  const solConnected = solWallet.connected && !!solWallet.publicKey;

  const isConnected = ethConnected || solConnected;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const clearBurst = useCallback(() => setBurst(null), []);

  // Wallet-to-Aleph handoff:
  // - Ethereum: connector.getProvider() → EIP-1193 provider → aleph-write.ts
  // - Solana: useWallet() → signMessage adapter → aleph-write-sol.ts
  // Both paths are dynamically imported for code splitting.
  const handleCreate = async () => {
    if (!text.trim()) {
      setError("Can't serve an empty plate.");
      return;
    }

    if (!isConnected) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus('Al dente...');

    try {
      let result: PasteResult;

      if (ethConnected && connector) {
        // Ethereum path
        const provider = await connector.getProvider() as WalletProvider;
        const { createPaste, WrongChainError } = await import('@/services/aleph-write');
        try {
          result = await createPaste(provider, text);
        } catch (err: unknown) {
          if (!mountedRef.current) return;
          if (err instanceof WrongChainError) {
            throw new Error("Pasta's burning! Switch to Ethereum mainnet.");
          }
          throw err;
        }
      } else if (solConnected) {
        // Solana path
        const { createPasteSolana } = await import('@/services/aleph-write-sol');
        result = await createPasteSolana(solWallet as SolanaWallet, text);
      } else {
        throw new Error('No wallet connected');
      }

      if (!mountedRef.current) return;

      // Store explorer metadata so the Viewer can link to the Aleph Explorer
      storeExplorerMeta(result.fileHash, {
        itemHash: result.itemHash,
        sender: result.sender,
        chain: result.chain,
      });

      // Save to local history for "My Pasta" view
      addToHistory(result.chain, result.sender, {
        hash: result.fileHash,
        preview: text.slice(0, 80),
        createdAt: Date.now(),
        chain: result.chain,
      });

      setStatus('A tavola!');
      // Fire celebration burst from button center
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
      // Brief pause to show success state + burst
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!mountedRef.current) return;
      onPasteCreated(result.fileHash);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      setStatus(null);
      console.error('[Pasta Drop] createPaste failed:', err);
      if (err instanceof Error) {
        if (err.message.includes('rejected') || err.message.includes('denied')) {
          setError('Chef walked out. Try again?');
        } else {
          setError(err.message);
        }
      } else {
        setError("Kitchen's closed. Try again later.");
      }
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
      <CardFooter className="justify-end gap-2">
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
          <div className="flex gap-2">
            <Button onClick={() => openEthModal()}>
              Connect Ethereum
            </Button>
            <Button variant="outline" onClick={() => solWallet.select?.('Phantom' as never)}>
              Connect Solana
            </Button>
          </div>
        )}
      </CardFooter>
      {burst && <CelebrationBurst origin={burst} onComplete={clearBurst} />}
    </Card>
  );
}
