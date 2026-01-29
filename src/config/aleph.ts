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
