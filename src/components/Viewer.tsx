// src/components/Viewer.tsx

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchPaste } from '@/services/aleph-read';

interface ViewerProps {
  hash: string;
  onNewPaste: () => void;
}

export function Viewer({ hash, onNewPaste }: ViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetchPaste(hash)
      .then(setContent)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Kitchen's closed. Try again later.");
      })
      .finally(() => setIsLoading(false));
  }, [hash]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setBouncing(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setBouncing(false), 350);
  };

  return (
    <Card className="w-full max-w-3xl card-entrance">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Buon appetito!</span>
          <span className="text-sm font-mono text-muted-foreground">
            {hash.slice(0, 8)}...{hash.slice(-8)}
          </span>
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
        <Button variant="outline" onClick={copyLink} className={`flex-1 ${bouncing ? 'button-bounce' : ''}`}>
          {copied ? 'Perfetto!' : 'Mangia!'}
        </Button>
        <Button onClick={onNewPaste} className="flex-1">
          Cook your own
        </Button>
      </CardFooter>
    </Card>
  );
}
