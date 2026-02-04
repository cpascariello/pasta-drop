// src/components/Viewer.tsx

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchPaste } from '@/services/aleph-read';
import { ALEPH_EXPLORER_URL, ALEPH_GATEWAY } from '@/config/aleph';
import { getExplorerMeta } from '@/services/explorer-meta';

interface ViewerProps {
  hash: string;
  onNewPaste: () => void;
}

export function Viewer({ hash, onNewPaste }: ViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let stale = false;
    const controller = new AbortController();

    (async () => {
      try {
        const text = await fetchPaste(hash);
        if (!stale) {
          setContent(text);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!stale) {
          setError(err instanceof Error ? err.message : "Kitchen's closed. Try again later.");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      stale = true;
      controller.abort();
    };
  }, [hash]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {
      setError('Could not copy to clipboard');
    });
    setCopied(true);
    setBounceKey(k => k + 1);
    clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-3xl card-entrance">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="-rotate-1" style={{ fontFamily: '"Erica One", cursive' }}>Pasta Served</span>
          <a
            href={(() => {
              const meta = getExplorerMeta(hash);
              if (meta) {
                return `${ALEPH_EXPLORER_URL}/address/${meta.chain}/${meta.sender}/message/STORE/${meta.itemHash}`;
              }
              return `${ALEPH_GATEWAY}/storage/raw/${hash}`;
            })()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-muted-foreground underline hover:text-foreground transition-colors"
          >
            {hash.slice(0, 8)}...{hash.slice(-8)}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <span className="text-muted-foreground">Al dente...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <span className="text-red-500">{error}</span>
          </div>
        ) : (
          <pre className="min-h-[400px] p-4 bg-muted rounded-md overflow-auto font-mono text-sm whitespace-pre-wrap">
            {content}
          </pre>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button key={bounceKey} variant="outline" onClick={copyLink} className={`flex-1 ${bounceKey > 0 ? 'button-bounce' : ''}`}>
          {copied ? 'Copied!' : 'Share your bolo'}
        </Button>
        <Button onClick={onNewPaste} className="flex-1">
          Drop another
        </Button>
      </CardFooter>
    </Card>
  );
}
