// src/services/pasta-history.ts
// LocalStorage-based history for tracking pastes per wallet.
//
// History is keyed by chain + address so each wallet has its own list.
// Entries are stored newest-first. Only metadata is kept locally —
// the actual paste content lives on Aleph and is immutable.
// "Deleting" a paste only removes it from local history.

export interface PastaEntry {
  hash: string;
  preview: string;      // First ~80 chars of content
  createdAt: number;     // Unix timestamp (ms)
  chain: 'ETH' | 'SOL';
}

const STORAGE_PREFIX = 'pasta-history';
const MAX_ENTRIES = 50;

function storageKey(chain: string, address: string): string {
  return `${STORAGE_PREFIX}:${chain}:${address.toLowerCase()}`;
}

/**
 * Get all history entries for a wallet, newest first.
 */
export function getHistory(chain: string, address: string): PastaEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(chain, address));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Add a new entry to the front of the history.
 */
export function addToHistory(chain: string, address: string, entry: PastaEntry): void {
  const history = getHistory(chain, address);
  // Avoid duplicates
  const filtered = history.filter(e => e.hash !== entry.hash);
  filtered.unshift(entry);
  // Cap at MAX_ENTRIES
  if (filtered.length > MAX_ENTRIES) filtered.length = MAX_ENTRIES;
  localStorage.setItem(storageKey(chain, address), JSON.stringify(filtered));
}

/**
 * Remove an entry from history by hash.
 * This only removes from localStorage — the paste remains on Aleph.
 */
export function removeFromHistory(chain: string, address: string, hash: string): void {
  const history = getHistory(chain, address);
  const filtered = history.filter(e => e.hash !== hash);
  localStorage.setItem(storageKey(chain, address), JSON.stringify(filtered));
}
