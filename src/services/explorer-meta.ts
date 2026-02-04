// src/services/explorer-meta.ts
// Stores Aleph message metadata in localStorage so the Viewer can construct
// explorer links. Only the paste creator has this data — shared link viewers
// see a gateway link instead.

export interface ExplorerMeta {
  itemHash: string;
  sender: string;
  chain: 'ETH' | 'SOL';
}

const PREFIX = 'pasta-explorer';

export function storeExplorerMeta(fileHash: string, meta: ExplorerMeta): void {
  try {
    localStorage.setItem(`${PREFIX}:${fileHash}`, JSON.stringify(meta));
  } catch {
    // localStorage full or unavailable — non-critical
  }
}

export function getExplorerMeta(fileHash: string): ExplorerMeta | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${fileHash}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
