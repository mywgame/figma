/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { hdWalletEngine } from '../hd/HdWalletEngine.ts';

export interface SupportedToken {
  id: string;
  symbol: string;
  name: string;
  network: string; // e.g. 'USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'
  chainId: number | string;
  tokenStandard: 'ERC20' | 'TRC20';
  decimals: number;
  contractAddress: string;
  enabled: boolean;
  developmentOnly: boolean;
}

function sanitizeContractAddress(val: string | undefined, fallback: string): string {
  if (!val || typeof val !== 'string') return fallback;
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    cleaned = parts[parts.length - 1].trim();
  }
  return cleaned || fallback;
}

export class TokenRegistry {
  private tokens: SupportedToken[] = [];

  constructor() {
    this.initializeRegistry();
  }

  /**
   * Initialize supported tokens registry with environment variable overrides and safe defaults
   */
  private initializeRegistry() {
    // BSC Mainnet USDT
    const bscMainnetContract = sanitizeContractAddress(
      process.env.USDT_BEP20_CONTRACT || process.env.USDT_CONTRACT,
      '0x55d398326f99059fF775485246999027B3197955'
    );

    // Polygon Mainnet USDT
    const polygonMainnetContract = sanitizeContractAddress(
      process.env.USDT_POLYGON_CONTRACT,
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    );

    // TRON Mainnet USDT
    const tronMainnetContract = sanitizeContractAddress(
      process.env.USDT_TRC20_CONTRACT,
      'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
    );

    // MetaFirm Test USDT (BSC Testnet)
    const bscTestnetContract = sanitizeContractAddress(
      process.env.USDT_BEP20_TEST_CONTRACT || process.env.USDT_TEST_CONTRACT,
      '0x01F9Bc7BaBaFDFA8713628994dAEd75b8D07bF3C'
    );

    this.tokens = [
      {
        id: 'USDT_BEP20_MAIN',
        symbol: 'USDT',
        name: 'Tether USD (BSC)',
        network: 'USDT_BEP20',
        chainId: 56,
        tokenStandard: 'ERC20',
        decimals: parseInt(process.env.USDT_BEP20_DECIMALS || '18', 10),
        contractAddress: bscMainnetContract,
        enabled: true,
        developmentOnly: false,
      },
      {
        id: 'USDT_POLYGON_MAIN',
        symbol: 'USDT',
        name: 'Tether USD (Polygon)',
        network: 'USDT_POLYGON',
        chainId: 137,
        tokenStandard: 'ERC20',
        decimals: parseInt(process.env.USDT_POLYGON_DECIMALS || '6', 10),
        contractAddress: polygonMainnetContract,
        enabled: true,
        developmentOnly: false,
      },
      {
        id: 'USDT_TRC20_MAIN',
        symbol: 'USDT',
        name: 'Tether USD (TRON)',
        network: 'USDT_TRC20',
        chainId: 728126428,
        tokenStandard: 'TRC20',
        decimals: parseInt(process.env.USDT_TRC20_DECIMALS || '6', 10),
        contractAddress: tronMainnetContract,
        enabled: true,
        developmentOnly: false,
      },
      {
        id: 'USDT_BEP20_TEST',
        symbol: 'USDT',
        name: 'MetaFirm Test USDT (BSC Testnet)',
        network: 'USDT_BEP20',
        chainId: 97,
        tokenStandard: 'ERC20',
        decimals: parseInt(process.env.USDT_BEP20_DECIMALS || '18', 10),
        contractAddress: bscTestnetContract,
        enabled: true,
        developmentOnly: true,
      },
    ];

    // Startup contract address checksum validation
    this.validateRegistryAtStartup();
  }

  /**
   * Fail-fast startup validation for all configured EVM & TRON contract addresses
   */
  public validateRegistryAtStartup() {
    for (const token of this.tokens) {
      if (!token.enabled) continue;

      if (token.tokenStandard === 'ERC20') {
        try {
          // Normalize and checksum address via ethers
          const checksummed = ethers.getAddress(token.contractAddress.trim().toLowerCase());
          token.contractAddress = checksummed;
        } catch (err: any) {
          throw new Error(
            `[TokenRegistry] Startup Validation Error: Invalid EVM contract address '${token.contractAddress}' ` +
            `for token '${token.id}' on network '${token.network}': ${err.message}`
          );
        }
      } else if (token.tokenStandard === 'TRC20') {
        if (!hdWalletEngine.isValidTronAddress(token.contractAddress)) {
          throw new Error(
            `[TokenRegistry] Startup Validation Error: Invalid TRON contract address '${token.contractAddress}' ` +
            `for token '${token.id}' on network '${token.network}'`
          );
        }
      }
    }
  }

  /**
   * Check whether development/test tokens are allowed
   */
  public areTestTokensEnabled(): boolean {
    return (
      process.env.ENABLE_TEST_TOKENS === 'true' ||
      process.env.ENABLE_DEVELOPMENT_TOKENS === 'true' ||
      blockchainConfig.isTestnet
    );
  }

  /**
   * Get all tokens in registry
   */
  public getAllTokens(): SupportedToken[] {
    return [...this.tokens];
  }

  /**
   * Get active tokens according to enable status and environment
   */
  public getActiveTokens(): SupportedToken[] {
    const allowTest = this.areTestTokensEnabled();
    return this.tokens.filter((t) => {
      if (!t.enabled) return false;
      if (t.developmentOnly && !allowTest) return false;
      return true;
    });
  }

  /**
   * Get active tokens for a given network
   */
  public getTokensForNetwork(network: string): SupportedToken[] {
    return this.getActiveTokens().filter(
      (t) => t.network.toUpperCase() === network.toUpperCase()
    );
  }

  /**
   * Get active contract addresses for a given network
   */
  public getContractAddressesForNetwork(network: string): string[] {
    return this.getTokensForNetwork(network).map((t) => t.contractAddress);
  }

  /**
   * Find token by contract address on a network
   */
  public findTokenByContract(network: string, contractAddress: string): SupportedToken | null {
    if (!contractAddress) return null;
    const tokens = this.getTokensForNetwork(network);

    const normTarget = contractAddress.toLowerCase().trim();
    for (const t of tokens) {
      if (t.contractAddress.toLowerCase().trim() === normTarget) {
        return t;
      }
    }
    return null;
  }

  /**
   * Check if a contract address is supported on a network
   */
  public isSupportedContract(network: string, contractAddress: string): boolean {
    return this.findTokenByContract(network, contractAddress) !== null;
  }
}

export const tokenRegistry = new TokenRegistry();
export default tokenRegistry;
