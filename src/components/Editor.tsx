// src/components/Editor.tsx

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPaste, WrongChainError, type WalletProvider } from '@/services/aleph';

interface EditorProps {
  onPasteCreated: (hash: string) => void;
}

export function Editor({ onPasteCreated }: EditorProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const { address, isConnected, connector } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();

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
      const hash = await createPaste(provider, text);
      setStatus('A tavola!');
      // Brief pause to show success state
      await new Promise(resolve => setTimeout(resolve, 500));
      onPasteCreated(hash);
    } catch (err) {
      setStatus(null);
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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>New Pasta</span>
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={() => disconnect()}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => open()}>
              Connect Wallet
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Drop your pasta here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px] font-mono"
          disabled={isLoading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        {status && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{status}</p>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button
            onClick={handleCreate}
            disabled={isLoading || !text.trim()}
            className="w-full"
          >
            <span className={isLoading ? 'pasta-spin-fast' : 'pasta-spin'}>🍝</span>
            {' '}
            {isLoading ? status || 'Al dente...' : 'Al dente'}
          </Button>
        ) : (
          <Button onClick={() => open()} className="w-full">
            Connect Wallet to Drop Pasta
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
