// src/services/aleph.ts

import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { ETHAccount } from '@aleph-sdk/ethereum';
import { JsonRPCWallet } from '@aleph-sdk/evm';
import { providers } from 'ethers5';
import { ALEPH_CHANNEL, ETH_MAINNET_CHAIN_ID, ALEPH_GATEWAY } from '../config/aleph';

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

  // Step 6: Convert text to Blob/File for storage
  const blob = new Blob([text], { type: 'text/plain' });
  const file = new File([blob], 'pasta.txt', { type: 'text/plain' });

  // Step 7: Store the file (triggers signature popup)
  const result = await client.createStore({
    fileObject: file,
    channel: ALEPH_CHANNEL,
    sync: true,
  });

  return result.item_hash;
}

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
