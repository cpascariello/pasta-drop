// src/components/PastaHistory.tsx

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHistory, removeFromHistory, type PastaEntry } from '@/services/pasta-history';

interface PastaHistoryProps {
  chain: string;
  address: string;
  onViewPaste: (hash: string) => void;
  onNewPaste: () => void;
}

export function PastaHistory({ chain, address, onViewPaste, onNewPaste }: PastaHistoryProps) {
  const [entries, setEntries] = useState<PastaEntry[]>(() => getHistory(chain, address));

  const handleDelete = (hash: string) => {
    removeFromHistory(chain, address, hash);
    setEntries(getHistory(chain, address));
  };

  const handleCopyLink = (hash: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full max-w-3xl card-entrance">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="-rotate-1" style={{ fontFamily: '"Erica One", cursive' }}>My Pasta</span>
          <span className="text-sm font-mono text-muted-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <span className="text-muted-foreground">No pasta yet. Start cooking!</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.hash}
                className="flex items-start gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{entry.preview}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(entry.createdAt)} · {entry.hash.slice(0, 8)}...{entry.hash.slice(-4)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewPaste(entry.hash)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(entry.hash)}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(entry.hash)}
                    className="text-destructive hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onNewPaste}>
          Cook your own
        </Button>
      </CardFooter>
    </Card>
  );
}
