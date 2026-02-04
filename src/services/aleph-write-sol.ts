// src/services/aleph-write-sol.ts
// Solana write path — uses @aleph-sdk/solana for signing.
//
// Mirrors the Ethereum write path (aleph-write.ts) but uses SOLAccount
// instead of ETHAccount. The message structure and API endpoint are the
// same — only the chain identifier and signing mechanism differ.

import { getAccountFromProvider } from '@aleph-sdk/solana';
import { PublicKey } from '@solana/web3.js';
import { ALEPH_API_SERVER, ALEPH_CHANNEL } from '../config/aleph';
import type { PasteResult } from './aleph-write';

/**
 * Minimal Solana signer interface expected by @aleph-sdk/solana's
 * getAccountFromProvider. Bridges AppKit's Solana Provider to the
 * MessageSigner shape the Aleph SDK needs.
 */
interface AlephMessageSigner {
  publicKey: PublicKey;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  connected: boolean;
  connect(): Promise<void>;
}

/**
 * AppKit Solana provider shape (subset of what we actually use).
 */
export interface SolanaProvider {
  publicKey?: { toBase58(): string };
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

/**
 * SHA-256 hash of a Uint8Array, returned as hex string.
 */
async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a paste using a Solana wallet and store it on Aleph.
 * Accepts AppKit's Solana provider and the wallet address string.
 * Returns a PasteResult with file hash and explorer metadata.
 */
export async function createPasteSolana(
  provider: SolanaProvider,
  address: string,
  text: string
): Promise<PasteResult> {
  if (!address) {
    throw new Error('Solana wallet not connected');
  }

  // Bridge AppKit provider to the MessageSigner interface Aleph expects
  const messageSigner: AlephMessageSigner = {
    publicKey: new PublicKey(address),
    signMessage: (msg: Uint8Array) => provider.signMessage(msg),
    connected: true,
    connect: async () => {},
  };

  // Create Aleph SOLAccount from the adapted signer
  const account = await getAccountFromProvider(messageSigner as Parameters<typeof getAccountFromProvider>[0]);

  // Encode text and compute file hash
  const fileBytes = new TextEncoder().encode(text);
  const fileHash = await sha256Hex(fileBytes);

  // Build item_content — same structure as Ethereum, different chain
  const time = Date.now() / 1000;
  const itemContent = {
    address,
    item_type: 'storage',
    item_hash: fileHash,
    time,
  };
  const itemContentStr = JSON.stringify(itemContent);

  // item_hash = SHA-256 of the item_content JSON string
  const itemContentBytes = new TextEncoder().encode(itemContentStr);
  const itemHash = await sha256Hex(itemContentBytes);

  // Sign the message.
  // Verification buffer format: [chain, sender, type, item_hash].join('\n')
  const { Buffer } = await import('buffer');
  const signable = {
    time,
    sender: address,
    getVerificationBuffer: () =>
      Buffer.from(['SOL', address, 'STORE', itemHash].join('\n')),
  };
  const signature = await account.sign(signable);

  // Assemble the full Aleph message — chain is 'SOL'
  const message = {
    chain: 'SOL',
    sender: address,
    channel: ALEPH_CHANNEL,
    time,
    item_type: 'inline',
    item_content: itemContentStr,
    item_hash: itemHash,
    type: 'STORE',
    signature,
  };

  // POST to the same Aleph API endpoint
  const formData = new FormData();
  formData.append('metadata', JSON.stringify({
    message,
    sync: true,
  }));
  formData.append('file', new Blob([fileBytes], { type: 'application/octet-stream' }));

  const response = await fetch(`${ALEPH_API_SERVER}/api/v0/storage/add_file`, {
    method: 'POST',
    body: formData,
  });

  // Aleph API may return 422 with a success body — parse JSON first
  const result = await response.json();
  if (!response.ok && result?.status !== 'success') {
    throw new Error(`Aleph API error (${response.status}): ${JSON.stringify(result)}`);
  }
  return {
    fileHash: result.hash ?? fileHash,
    itemHash,
    sender: address,
    chain: 'SOL',
  };
}
