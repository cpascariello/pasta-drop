// src/services/aleph-read.ts
// Lightweight read path — zero heavy dependencies (no Aleph SDK, no ethers)

import { ALEPH_GATEWAY } from '../config/aleph';

/**
 * Fetch a paste by its content hash.
 * This is a READ operation - no wallet needed.
 *
 * @param hash - The content hash returned from createPaste
 * @returns The text content of the paste
 */
export async function fetchPaste(hash: string): Promise<string> {
  const url = `${ALEPH_GATEWAY}/storage/raw/${hash}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Kitchen's closed. Try again later.");
  }

  return response.text();
}
