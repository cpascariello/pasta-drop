// src/config/aleph.ts

/**
 * Channel identifier for organizing data on Aleph.
 * All pastes from this app are grouped under this channel.
 */
export const ALEPH_CHANNEL = 'PASTA_DROP';

/**
 * Ethereum Mainnet chain ID in hex format.
 * Required for signing with Ethereum wallets.
 */
export const ETH_MAINNET_CHAIN_ID = '0x1';

/**
 * Aleph gateway URL for fetching stored files.
 * Files are accessible at: {ALEPH_GATEWAY}/storage/raw/{hash}
 */
export const ALEPH_GATEWAY = 'https://api2.aleph.im/api/v0';

/**
 * Aleph API server for write operations (createStore, etc.).
 * The SDK defaults to api3.aleph.im which returns 422 for store uploads;
 * api2 accepts them.
 */
export const ALEPH_API_SERVER = 'https://api2.aleph.im';

/**
 * ALEPH ERC-20 token contract on Ethereum mainnet.
 * Needed to check balance before store operations (3 MB per ALEPH held).
 */
export const ALEPH_TOKEN_ADDRESS = '0x27702a26126e0b3702af63ee09ac4d1a084ef628';

/**
 * Aleph Explorer base URL for viewing stored messages.
 */
export const ALEPH_EXPLORER_URL = 'https://explorer.aleph.cloud';
