/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchainConfig.ts';

export interface RpcEndpoint {
  url: string;
  weight: number;
  isFailing?: boolean;
  lastFailureTime?: number;
}

export class RpcManager {
  private endpoints: Record<string, RpcEndpoint[]> = {};
  private ethersProviderCache: Map<string, ethers.JsonRpcProvider> = new Map();
  private logCooldowns: Map<string, number> = new Map();

  constructor() {
    this.initializeEndpoints();
  }

  private initializeEndpoints() {
    const isTestnet = blockchainConfig.isTestnet;

    // BSC endpoints
    const bscEnvPrimary = process.env.BSC_RPC_URL;
    const bscEnvSecondary = process.env.BSC_RPC_URL_FALLBACK;

    const defaultBsc = isTestnet
      ? [
          'https://data-seed-prebsc-1-s1.binance.org:8545',
          'https://bsc-testnet.publicnode.com',
          'https://data-seed-prebsc-2-s1.binance.org:8545',
        ]
      : [
          'https://bsc-dataseed.binance.org',
          'https://bsc-dataseed1.defibit.io',
          'https://1rpc.io/bnb',
        ];

    const bscUrls = [
      ...(bscEnvPrimary ? [bscEnvPrimary] : []),
      ...(bscEnvSecondary ? [bscEnvSecondary] : []),
      ...defaultBsc,
    ];

    this.endpoints['USDT_BEP20'] = Array.from(new Set(bscUrls)).map((url, i) => ({
      url,
      weight: 100 - i * 10,
    }));

    // Polygon endpoints
    const polygonEnvPrimary = process.env.POLYGON_RPC_URL;
    const polygonEnvSecondary = process.env.POLYGON_RPC_URL_FALLBACK;

    const defaultPolygon = isTestnet
      ? [
          'https://rpc-amoy.polygon.technology',
          'https://polygon-amoy.drpc.org',
          'https://polygon-amoy.publicnode.com',
        ]
      : [
          'https://polygon.drpc.org',
          'https://1rpc.io/matic',
          'https://polygon-bor.publicnode.com',
        ];

    const polygonUrls = [
      ...(polygonEnvPrimary ? [polygonEnvPrimary] : []),
      ...(polygonEnvSecondary ? [polygonEnvSecondary] : []),
      ...defaultPolygon,
    ];

    this.endpoints['USDT_POLYGON'] = Array.from(new Set(polygonUrls)).map((url, i) => ({
      url,
      weight: 100 - i * 10,
    }));

    // Tron endpoints
    const tronEnvPrimary = process.env.TRON_RPC_URL;
    const tronEnvSecondary = process.env.TRON_RPC_URL_FALLBACK;

    const defaultTron = isTestnet
      ? [
          'https://nile.trongrid.io',
          'https://api.shasta.trongrid.io',
        ]
      : [
          'https://api.trongrid.io',
          'https://tron.drpc.org',
          'https://api.tronstack.io',
        ];

    const tronUrls = [
      ...(tronEnvPrimary ? [tronEnvPrimary] : []),
      ...(tronEnvSecondary ? [tronEnvSecondary] : []),
      ...defaultTron,
    ];

    this.endpoints['USDT_TRC20'] = Array.from(new Set(tronUrls)).map((url, i) => ({
      url,
      weight: 100 - i * 10,
    }));
  }

  /**
   * Get or create a cached ethers JsonRpcProvider instance configured with staticNetwork
   * to eliminate "failed to detect network" warnings and avoid creating transient providers.
   */
  public getEthersProvider(network: string, rpcUrl: string): ethers.JsonRpcProvider {
    const cacheKey = `${network}:${rpcUrl}`;
    if (!this.ethersProviderCache.has(cacheKey)) {
      const isTestnet = blockchainConfig.isTestnet;
      const chainIdMap: Record<string, number> = {
        USDT_BEP20: isTestnet ? 97 : 56,
        USDT_POLYGON: isTestnet ? 80002 : 137,
      };

      const chainId = chainIdMap[network];
      let provider: ethers.JsonRpcProvider;

      if (chainId) {
        const netObj = ethers.Network.from(chainId);
        provider = new ethers.JsonRpcProvider(rpcUrl, netObj, {
          staticNetwork: netObj,
          batchMaxCount: 1,
        });
      } else {
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      this.ethersProviderCache.set(cacheKey, provider);
    }
    return this.ethersProviderCache.get(cacheKey)!;
  }

  /**
   * Log messages with rate limiting to eliminate terminal spam
   */
  public logThrottled(
    key: string,
    level: 'warn' | 'error' | 'info',
    message: string,
    cooldownMs = 60000
  ) {
    const now = Date.now();
    const lastTime = this.logCooldowns.get(key) || 0;
    if (now - lastTime > cooldownMs) {
      this.logCooldowns.set(key, now);
      if (level === 'error') console.error(message);
      else if (level === 'warn') console.warn(message);
      else console.log(message);
    }
  }

  /**
   * Get active RPC endpoint for a given network with failover support
   */
  public getEndpoint(network: string): string {
    const list = this.endpoints[network] || [];
    const now = Date.now();

    // Reset endpoints that failed more than 2 minutes ago
    for (const ep of list) {
      if (ep.isFailing && ep.lastFailureTime && now - ep.lastFailureTime > 120000) {
        ep.isFailing = false;
      }
    }

    const available = list.filter((ep) => !ep.isFailing);
    if (available.length === 0) {
      // If all are failing, reset all and return the first one
      for (const ep of list) ep.isFailing = false;
      return list[0]?.url || '';
    }

    return available[0].url;
  }

  /**
   * Mark an endpoint as failing to trigger failover
   */
  public markFailing(network: string, url: string) {
    const list = this.endpoints[network] || [];
    const target = list.find((ep) => ep.url === url);
    if (target) {
      target.isFailing = true;
      target.lastFailureTime = Date.now();
      this.logThrottled(
        `failing_${network}_${url}`,
        'warn',
        `[RpcManager] Marked RPC endpoint as failing for ${network}: ${url}`
      );
    }
  }

  /**
   * Check if an error is a non-retryable application/configuration error
   */
  private isNonRetryableError(err: any): boolean {
    if (!err) return false;
    const code = err.code;
    const msg = (err.message || '').toLowerCase();

    const nonRetryableCodes = [
      'INVALID_ARGUMENT',
      'NUMERIC_FAULT',
      'UNSUPPORTED_OPERATION',
      'BUFFER_OVERRUN',
      'MISSING_ARGUMENT',
      'UNEXPECTED_ARGUMENT',
      'INVALID_OPTION',
    ];

    if (code && nonRetryableCodes.includes(code)) {
      return true;
    }

    if (
      msg.includes('bad address checksum') ||
      msg.includes('invalid address') ||
      msg.includes('invalid hex') ||
      msg.includes('invalid argument') ||
      msg.includes('abi encoding')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Execute JSON-RPC call with automatic RPC failover and retry
   */
  public async executeRpc<T>(
    network: string,
    executor: (rpcUrl: string) => Promise<T>
  ): Promise<T> {
    const list = this.endpoints[network] || [];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < Math.max(3, list.length); attempt++) {
      const url = this.getEndpoint(network);
      try {
        return await executor(url);
      } catch (err: any) {
        if (this.isNonRetryableError(err)) {
          this.logThrottled(
            `non_retryable_${network}`,
            'error',
            `[RpcManager] Non-retryable error on ${url} for ${network}: ${err.message}`
          );
          throw err;
        }
        lastError = err;
        this.markFailing(network, url);
        this.logThrottled(
          `retry_${network}_${url}`,
          'warn',
          `[RpcManager] RPC transport call failed on ${url} for ${network}: ${err.message}. Retrying with next endpoint...`
        );
      }
    }

    throw new Error(
      `[RpcManager] All RPC endpoints failed for network ${network}. Last error: ${lastError?.message}`
    );
  }
}

export const rpcManager = new RpcManager();
export default rpcManager;
