// src/config/aleph.ts
//
// Aleph Cloud configuration constants.
// Docs: https://docs.aleph.cloud/

/**
 * Channel identifier for organizing data on Aleph.
 *
 * Channels are namespaces that group messages by application. When querying
 * the Aleph network, you can filter by channel to find only your app's data.
 * Any string works — there's no registration required.
 *
 * Docs: https://docs.aleph.cloud/devhub/getting-started#channels
 */
export const ALEPH_CHANNEL = 'PASTA_DROP';

/**
 * Ethereum Mainnet chain ID in hex format.
 *
 * Aleph messages are anchored to a specific blockchain. Since we sign with
 * Ethereum wallets, the wallet must be on mainnet (chainId 0x1) for the
 * signature to be valid on the Aleph network.
 */
export const ETH_MAINNET_CHAIN_ID = '0x1';

/**
 * Aleph gateway URL for fetching stored files (READ path).
 *
 * Gateways are public HTTP endpoints that serve Aleph data without
 * authentication. Files are accessible at: {ALEPH_GATEWAY}/storage/raw/{hash}
 * where {hash} is the SHA-256 of the file content.
 *
 * Multiple gateways exist (api1, api2, api3). Reads work on all of them.
 */
export const ALEPH_GATEWAY = 'https://api2.aleph.im/api/v0';

/**
 * Aleph API server for write operations (WRITE path).
 *
 * Write operations (storing files, posting messages) go through the API
 * server's /api/v0/storage/add_file endpoint. We use api2.aleph.im because
 * api3.aleph.im returns 422 for store uploads (see Decision #13).
 */
export const ALEPH_API_SERVER = 'https://api2.aleph.im';

/**
 * ALEPH ERC-20 token contract on Ethereum mainnet.
 *
 * Aleph uses a token-based storage model: holding ALEPH tokens grants storage
 * quota (~3 MB per token held). The tokens are NOT spent — you just need to
 * hold them. We check the balance before attempting a store to give a clear
 * error message instead of a cryptic API failure.
 *
 * Contract: https://etherscan.io/token/0x27702a26126e0b3702af63ee09ac4d1a084ef628
 */
export const ALEPH_TOKEN_ADDRESS = '0x27702a26126e0b3702af63ee09ac4d1a084ef628';

/**
 * Aleph Explorer base URL for viewing stored messages.
 */
export const ALEPH_EXPLORER_URL = 'https://explorer.aleph.cloud';
