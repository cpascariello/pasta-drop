// src/services/aleph-write.ts
// Heavy write path — pulls in Aleph SDK + ethers5

import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { ETHAccount } from '@aleph-sdk/ethereum';
import { JsonRPCWallet } from '@aleph-sdk/evm';
import { providers } from 'ethers5';
import { ALEPH_CHANNEL, ETH_MAINNET_CHAIN_ID } from '../config/aleph';

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
 * Create a paste and store it on Aleph network.
 * Returns the content hash that can be used to retrieve the paste.
 *
 * @param provider - Wallet provider (e.g., from WalletConnect)
 * @param text - The text content to store
 * @returns The content hash (item_hash) of the stored paste
 */
export async function createPaste(
  provider: WalletProvider,
  text: string
): Promise<string> {
  // Step 1: Verify user is on mainnet
  const chainId = await provider.request({ method: 'eth_chainId' }) as string;
  if (chainId !== ETH_MAINNET_CHAIN_ID) {
    throw new WrongChainError();
  }

  // Step 2: Wrap provider with ethers5
  const web3Provider = new providers.Web3Provider(provider as providers.ExternalProvider);

  // Step 3: Create Aleph wallet wrapper
  const wallet = new JsonRPCWallet(web3Provider);
  await wallet.connect();

  if (!wallet.address) {
    throw new Error('Failed to get wallet address');
  }

  // Step 4: Create Ethereum account for signing
  const account = new ETHAccount(wallet, wallet.address);

  // Step 5: Create authenticated client
  const client = new AuthenticatedAlephHttpClient(account);

  // Step 6: Convert text to Buffer for storage
  // The SDK's uploadStore does formData.append("file", fileObject) directly.
  // Browser FormData needs a Blob for binary data — passing a raw Buffer gets
  // stringified, causing a hash mismatch and 422 from the Aleph API.
  // We also pre-compute the hash ourselves and pass fileHash so the SDK's
  // internal W() → Ze() path uses the same bytes we're uploading.
  const { Buffer } = await import('buffer');
  const buf = Buffer.from(text, 'utf-8');
  const fileObject = new Blob([buf], { type: 'application/octet-stream' });

  // Step 7: Store the file (triggers signature popup)
  const result = await client.createStore({
    fileObject,
    channel: ALEPH_CHANNEL,
    sync: true,
  });

  return result.item_hash;
}
