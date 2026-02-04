// src/services/aleph-write-sol.ts
// Solana write path — uses @aleph-sdk/solana for signing.
//
// Mirrors the Ethereum write path (aleph-write.ts) but uses SOLAccount
// instead of ETHAccount. The message structure and API endpoint are the
// same — only the chain identifier and signing mechanism differ.

import { getAccountFromProvider } from '@aleph-sdk/solana';
import { ALEPH_API_SERVER, ALEPH_CHANNEL } from '../config/aleph';
import type { PasteResult } from './aleph-write';

/**
 * Solana wallet interface matching what @solana/wallet-adapter-react provides.
 * This is the MessageSigner interface that @aleph-sdk/solana expects.
 */
export interface SolanaWallet {
  publicKey: { toBase58(): string; toBytes(): Uint8Array };
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  connected: boolean;
  connect(): Promise<void>;
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
 * Returns a PasteResult with file hash and explorer metadata.
 */
export async function createPasteSolana(
  wallet: SolanaWallet,
  text: string
): Promise<PasteResult> {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error('Solana wallet not connected');
  }

  const senderAddress = wallet.publicKey.toBase58();

  // Create Aleph SOLAccount from the wallet provider.
  // getAccountFromProvider wraps the wallet's signMessage for Aleph signing.
  const account = await getAccountFromProvider(wallet as Parameters<typeof getAccountFromProvider>[0]);

  // Encode text and compute file hash
  const fileBytes = new TextEncoder().encode(text);
  const fileHash = await sha256Hex(fileBytes);

  // Build item_content — same structure as Ethereum, different chain
  const time = Date.now() / 1000;
  const itemContent = {
    address: senderAddress,
    item_type: 'storage',
    item_hash: fileHash,
    time,
  };
  const itemContentStr = JSON.stringify(itemContent);

  // item_hash = SHA-256 of the item_content JSON string
  const itemContentBytes = new TextEncoder().encode(itemContentStr);
  const itemHash = await sha256Hex(itemContentBytes);

  // Sign the message.
  // Verification buffer format is the same: [chain, sender, type, item_hash].join('\n')
  // but with 'SOL' instead of 'ETH'.
  const { Buffer } = await import('buffer');
  const signable = {
    time,
    sender: senderAddress,
    getVerificationBuffer: () =>
      Buffer.from(['SOL', senderAddress, 'STORE', itemHash].join('\n')),
  };
  const signature = await account.sign(signable);

  // Assemble the full Aleph message — chain is 'SOL'
  const message = {
    chain: 'SOL',
    sender: senderAddress,
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Aleph API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    fileHash: result.hash ?? fileHash,
    itemHash,
    sender: senderAddress,
    chain: 'SOL',
  };
}
