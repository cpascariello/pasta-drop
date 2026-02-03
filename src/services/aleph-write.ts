// src/services/aleph-write.ts
// Heavy write path — pulls in Aleph SDK + ethers5
//
// NOTE: We bypass the SDK's createStore because the SDK v1.x includes
// item_content in store messages, but the Aleph API now rejects that
// with 422: "storage messages cannot define item_content".
// Instead we build the message manually, sign it with the SDK's account,
// and POST the FormData ourselves.

import { ETHAccount } from '@aleph-sdk/ethereum';
import { JsonRPCWallet } from '@aleph-sdk/evm';
import { providers } from 'ethers5';
import { ALEPH_API_SERVER, ALEPH_CHANNEL, ALEPH_TOKEN_ADDRESS, ETH_MAINNET_CHAIN_ID } from '../config/aleph';

/**
 * Error thrown when user is on wrong chain
 */
export class WrongChainError extends Error {
  constructor() {
    super("Pasta's burning! Switch to Ethereum mainnet.");
    this.name = 'WrongChainError';
  }
}

/**
 * Provider interface for wallet interactions
 */
export interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
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
 * Create a paste and store it on Aleph network.
 * Returns the content hash that can be used to retrieve the paste.
 */
export async function createPaste(
  provider: WalletProvider,
  text: string
): Promise<string> {
  console.log('[Pasta Drop] createPaste v2 — bypassing SDK, posting to', ALEPH_API_SERVER);

  // Step 1: Verify user is on mainnet
  const chainId = await provider.request({ method: 'eth_chainId' }) as string;
  if (chainId !== ETH_MAINNET_CHAIN_ID) {
    throw new WrongChainError();
  }

  // Step 2: Check ALEPH token balance (need tokens to store data — 3 MB per ALEPH held)
  const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
  const sender = accounts[0];
  if (sender) {
    // ERC-20 balanceOf(address) call
    const balanceData = await provider.request({
      method: 'eth_call',
      params: [{
        to: ALEPH_TOKEN_ADDRESS,
        data: '0x70a08231000000000000000000000000' + sender.slice(2).toLowerCase(),
      }, 'latest'],
    }) as string;
    const balance = BigInt(balanceData);
    if (balance === 0n) {
      throw new Error(
        'No ALEPH tokens found. You need ALEPH tokens in your wallet to store data on the Aleph network.'
      );
    }
  }

  // Step 3: Wrap provider with ethers5
  const web3Provider = new providers.Web3Provider(provider as providers.ExternalProvider);

  // Step 4: Create Aleph wallet wrapper
  const wallet = new JsonRPCWallet(web3Provider);
  await wallet.connect();

  if (!wallet.address) {
    throw new Error('Failed to get wallet address');
  }

  // Step 5: Create Ethereum account for signing
  const account = new ETHAccount(wallet, wallet.address);

  // Step 5: Encode text and compute file hash
  const fileBytes = new TextEncoder().encode(text);
  const fileHash = await sha256Hex(fileBytes);

  // Step 6: Build the store message content (what gets hashed for item_hash)
  const content = {
    address: wallet.address,
    item_type: 'storage',
    item_hash: fileHash,
    time: Date.now() / 1000,
  };
  const contentStr = JSON.stringify(content);
  const contentBytes = new TextEncoder().encode(contentStr);
  const itemHash = await sha256Hex(contentBytes);

  // Step 7: Build the unsigned message
  const message = {
    chain: 'ETH',
    sender: wallet.address,
    channel: ALEPH_CHANNEL,
    time: content.time,
    item_type: 'inline' as const,
    item_content: contentStr,
    item_hash: itemHash,
    type: 'STORE',
  };

  // Step 8: Sign the message (triggers wallet popup)
  // The SDK's account.sign expects a message-like object with these fields
  const signature = await account.sign(
    { item_hash: message.item_hash, sender: message.sender, type: 'STORE' } as unknown as Parameters<typeof account.sign>[0]
  );

  // Step 9: Build broadcastable message WITHOUT item_content
  // The Aleph API now rejects store messages that include item_content
  const broadcastable = {
    chain: message.chain,
    sender: message.sender,
    channel: message.channel,
    time: message.time,
    item_type: message.item_type,
    item_hash: message.item_hash,
    // item_content deliberately omitted — server rejects it for store messages
    type: message.type,
    signature,
  };

  // Step 10: Build FormData and upload
  const formData = new FormData();
  formData.append('metadata', JSON.stringify({
    message: broadcastable,
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
  return result.item_hash ?? itemHash;
}
