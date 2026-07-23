/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

export interface NetworkConfig {
  contractAddress: string;
  xpub: string;
  hotPrivateKey: string;
  hotAddress?: string;
  coldAddress?: string;
  chainName: string;
  decimals: number;
}

export type BlockchainEnvironment = 'production' | 'sandbox' | 'development';

// Parse BLOCKCHAIN_ENV strictly as the single source of truth
const rawEnv = process.env.BLOCKCHAIN_ENV?.trim().toLowerCase();

if (!rawEnv) {
  throw new Error(
    "[blockchainConfig] Critical Configuration Error: BLOCKCHAIN_ENV environment variable is missing or empty. " +
    "You must explicitly set BLOCKCHAIN_ENV to 'production', 'sandbox', 'testnet', or 'development' in your environment configuration."
  );
}

let blockchainEnv: BlockchainEnvironment;
let isTestnet: boolean;

if (rawEnv === 'production' || rawEnv === 'mainnet') {
  blockchainEnv = 'production';
  isTestnet = false;
} else if (rawEnv === 'sandbox' || rawEnv === 'testnet') {
  blockchainEnv = 'sandbox';
  isTestnet = true;
} else if (rawEnv === 'development') {
  blockchainEnv = 'development';
  isTestnet = true;
} else {
  throw new Error(
    `[blockchainConfig] Critical Configuration Error: Invalid BLOCKCHAIN_ENV value '${process.env.BLOCKCHAIN_ENV}'. ` +
    "Allowed values are 'production', 'sandbox', 'testnet', or 'development'."
  );
}

export { blockchainEnv };

const apiKey = process.env.TATUM_API_KEY || '';
const baseUrl = process.env.TATUM_BASE_URL || 'https://api.tatum.io';

export const blockchainConfig = {
  env: blockchainEnv,
  baseUrl: baseUrl,
  apiKey: apiKey,
  isConfigured: !!apiKey,
  isTestnet: isTestnet,

  networks: {
    USDT_BEP20: {
      contractAddress:
        process.env.USDT_BEP20_CONTRACT ||
        process.env.USDT_CONTRACT ||
        (isTestnet
          ? '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
          : '0x55d398326f99059ff775485246999027b3197955'),
      xpub: process.env.USDT_BEP20_XPUB || process.env.USDT_XPUB || '',
      hotPrivateKey:
        process.env.USDT_BEP20_HOT_PRIVATE_KEY ||
        process.env.HOT_WALLET_PRIVATE_KEY ||
        '',
      hotAddress:
        process.env.USDT_BEP20_HOT_ADDRESS ||
        process.env.HOT_WALLET_ADDRESS ||
        '',
      chainName: 'BSC',
      decimals: parseInt(process.env.USDT_BEP20_DECIMALS || process.env.USDT_DECIMALS || '18', 10),
    } as NetworkConfig,

    USDT_POLYGON: {
      contractAddress:
        process.env.USDT_POLYGON_CONTRACT ||
        (isTestnet
          ? '0x41e94eb019c0762f9bfcf9fb1e58725bfb01728b'
          : '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'),
      xpub: process.env.USDT_POLYGON_XPUB || '',
      hotPrivateKey: process.env.USDT_POLYGON_HOT_PRIVATE_KEY || '',
      hotAddress: process.env.USDT_POLYGON_HOT_ADDRESS || '',
      chainName: 'POLYGON',
      decimals: parseInt(process.env.USDT_POLYGON_DECIMALS || '6', 10),
    } as NetworkConfig,

    USDT_TRC20: {
      contractAddress:
        process.env.USDT_TRC20_CONTRACT ||
        (isTestnet
          ? 'TXYZdfUrW2Dx79gSStj7Q47S8oexuF3pC3'
          : 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'),
      xpub: process.env.USDT_TRC20_XPUB || '',
      hotPrivateKey: process.env.USDT_TRC20_HOT_PRIVATE_KEY || '',
      hotAddress: process.env.USDT_TRC20_HOT_ADDRESS || '',
      chainName: 'TRON',
      decimals: parseInt(process.env.USDT_TRC20_DECIMALS || '6', 10),
    } as NetworkConfig,
  } as Record<string, NetworkConfig>,
};
export default blockchainConfig;
