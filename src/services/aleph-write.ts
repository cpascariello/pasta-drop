// src/services/aleph-write.ts
// Heavy write path — pulls in Aleph SDK + ethers5
//
// Aleph Cloud is a decentralized storage network. Data is stored as "messages"
// that are signed by the sender's wallet and broadcast to Aleph compute nodes.
//
// A STORE message tells the network to persist a file. The message structure has
// two layers:
//   1. The outer message envelope (chain, sender, type, signature, etc.)
//   2. The inner item_content JSON (metadata about what's being stored)
//
// We bypass the SDK's createStore() due to compatibility issues with the
// current API (see Decision #12 in docs/DECISIONS.md). Instead we construct
// the message manually, sign it with the SDK's ETHAccount, and POST the
// FormData ourselves to the /api/v0/storage/add_file endpoint.
//
// Docs: https://docs.aleph.cloud/devhub/sdks-and-tools/typescript-sdk/

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
 * Provider interface for wallet interactions.
 * This matches the EIP-1193 provider spec that MetaMask / WalletConnect expose.
 */
export interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

/**
 * SHA-256 hash of a Uint8Array, returned as hex string.
 * Uses the Web Crypto API (available in all modern browsers).
 * Aleph uses SHA-256 hashes as content addresses — the hash IS the address.
 */
async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Result of a paste creation — includes the file hash for the gateway
 * and metadata needed to construct the Aleph Explorer link.
 */
export interface PasteResult {
  /** SHA-256 of file bytes — gateway serves at /storage/raw/{fileHash} */
  fileHash: string;
  /** SHA-256 of item_content JSON — the message's item_hash on Aleph */
  itemHash: string;
  /** Wallet address that signed the message */
  sender: string;
  /** Blockchain used for signing */
  chain: 'ETH' | 'SOL';
}

/**
 * Create a paste and store it on the Aleph network.
 * Returns a PasteResult with both the file hash (for viewing) and the
 * message metadata (for the Aleph Explorer link).
 *
 * Flow:
 *   1. Verify Ethereum mainnet
 *   2. Check ALEPH token balance (required for storage quota)
 *   3. Wrap browser wallet for Aleph SDK signing
 *   4. Hash file bytes (SHA-256) — this becomes the content address
 *   5. Build item_content JSON (store metadata pointing to the file hash)
 *   6. Hash item_content (SHA-256) — this becomes the message's item_hash
 *   7. Sign the verification buffer with the user's wallet
 *   8. POST the signed message + file to the Aleph API
 */
export async function createPaste(
  provider: WalletProvider,
  text: string
): Promise<PasteResult> {
  // Step 1: Verify user is on Ethereum mainnet.
  // Aleph messages are anchored to a specific blockchain. Our messages use
  // chain: 'ETH', so the wallet must be on mainnet (chainId 0x1).
  const chainId = await provider.request({ method: 'eth_chainId' }) as string;
  if (chainId !== ETH_MAINNET_CHAIN_ID) {
    throw new WrongChainError();
  }

  // Step 2: Check ALEPH token balance.
  // Aleph uses a token-based storage model: each ALEPH token held gives
  // ~3 MB of storage quota. Without tokens, the API rejects store requests.
  // We check upfront to give a clear error message.
  // The check uses a raw ERC-20 balanceOf(address) call via eth_call.
  const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
  const sender = accounts[0];
  if (sender) {
    // 0x70a08231 is the function selector for balanceOf(address)
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

  // Step 3: Wrap the browser's EIP-1193 provider with ethers5.
  // The Aleph SDK's JsonRPCWallet expects an ethers v5 provider for signing.
  // wagmi gives us a raw EIP-1193 provider, so we wrap it here.
  const web3Provider = new providers.Web3Provider(provider as providers.ExternalProvider);

  // Step 4: Create Aleph wallet wrapper.
  // JsonRPCWallet adapts an ethers provider into the interface Aleph's
  // ETHAccount expects. connect() fetches the wallet address.
  const wallet = new JsonRPCWallet(web3Provider);
  await wallet.connect();

  if (!wallet.address) {
    throw new Error('Failed to get wallet address');
  }

  // Step 5: Create the Aleph ETHAccount for signing.
  // We only use the SDK for this — it handles the Ethereum personal_sign
  // flow that Aleph nodes use to verify message authenticity.
  const account = new ETHAccount(wallet, wallet.address);

  // Step 6: Encode the paste text and compute its SHA-256 hash.
  // This hash is the file's content address on Aleph. Anyone can retrieve
  // the file at: {ALEPH_GATEWAY}/storage/raw/{fileHash}
  const fileBytes = new TextEncoder().encode(text);
  const fileHash = await sha256Hex(fileBytes);

  // Step 7: Build item_content — the STORE message's inner metadata.
  // This JSON describes what we're storing:
  //   - address: who is storing it
  //   - item_type: 'storage' means the content is uploaded as a file (not inline)
  //   - item_hash: the SHA-256 of the actual file bytes
  //   - time: Unix timestamp (seconds)
  const time = Date.now() / 1000;
  const itemContent = {
    address: wallet.address,
    item_type: 'storage',
    item_hash: fileHash,
    time,
  };
  const itemContentStr = JSON.stringify(itemContent);

  // Step 8: Compute the item_hash for the outer message.
  // The outer message's item_hash is the SHA-256 of the item_content JSON
  // string. This creates a chain of hashes: message.item_hash -> item_content
  // -> item_content.item_hash -> actual file bytes.
  const itemContentBytes = new TextEncoder().encode(itemContentStr);
  const itemHash = await sha256Hex(itemContentBytes);

  // Step 9: Sign the message (triggers wallet popup).
  // Aleph nodes verify signatures by reconstructing a "verification buffer"
  // from the message fields: [chain, sender, type, item_hash].join('\n')
  // The SDK's sign() method calls message.getVerificationBuffer() to get
  // this buffer, then passes it to ethers' wallet.signMessage().
  const { Buffer } = await import('buffer');
  const signable = {
    time,
    sender: wallet.address,
    getVerificationBuffer: () =>
      Buffer.from(['ETH', wallet.address, 'STORE', itemHash].join('\n')),
  };
  const signature = await account.sign(signable);

  // Step 10: Assemble the full Aleph message.
  // The add_file endpoint requires item_type: 'inline' with item_content
  // embedded in the message. This is distinct from item_content.item_type
  // which is 'storage' (meaning the file is uploaded separately in FormData).
  const message = {
    chain: 'ETH',
    sender: wallet.address,
    channel: ALEPH_CHANNEL,
    time,
    item_type: 'inline',
    item_content: itemContentStr,
    item_hash: itemHash,
    type: 'STORE',
    signature,
  };

  // Step 11: POST to the Aleph API.
  // The add_file endpoint accepts FormData with two parts:
  //   - 'metadata': JSON with { message, sync } — the signed Aleph message
  //   - 'file': the raw file bytes
  // sync: true means wait for the message to be processed before responding.
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
    sender: wallet.address,
    chain: 'ETH',
  };
}
