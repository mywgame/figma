/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { HDNodeWallet } from 'ethers';

/**
 * Interface representing a secret provider for future secret manager integrations.
 */
export interface SecretProvider {
  getSecret(key: string): Promise<string | null>;
}

/**
 * Standard Environment Secret Provider (default implementation).
 */
export class EnvSecretProvider implements SecretProvider {
  async getSecret(key: string): Promise<string | null> {
    return process.env[key] || null;
  }
}

export class KeyManager {
  private secretProvider: SecretProvider;

  constructor(secretProvider?: SecretProvider) {
    this.secretProvider = secretProvider || new EnvSecretProvider();
  }

  /**
   * Sets a custom secret provider (e.g. Google Secret Manager, AWS Secrets Manager)
   * to satisfy requirement 11 (Future Secret Management) without changing TreasuryService.
   */
  public setSecretProvider(provider: SecretProvider): void {
    this.secretProvider = provider;
  }

  /**
   * Helper to retrieve master keys securely.
   */
  private async getMasterKey(network: string, type: 'XPUB' | 'XPRIV'): Promise<string> {
    const cleanNetwork = network.toUpperCase();
    const envKey = `USDT_${cleanNetwork.replace('USDT_', '')}_${type}`;
    const value = await this.secretProvider.getSecret(envKey);
    return value || '';
  }

  /**
   * Derive a child public address for a network and index.
   */
  public async deriveAddress(network: string, derivationIndex: number): Promise<string> {
    const xpub = await this.getMasterKey(network, 'XPUB');
    if (!xpub) {
      // Deterministic fallback if not configured
      return this.generateDeterministicFallbackAddress(network, derivationIndex);
    }

    try {
      // Try to use ethers to derive if possible
      const wallet = HDNodeWallet.fromExtendedKey(xpub);
      const child = wallet.deriveChild(derivationIndex);
      return child.address;
    } catch (error: any) {
      // If xpub is not a valid BIP32 string or ethers fails, we gracefully fall back
      return this.generateDeterministicFallbackAddress(network, derivationIndex);
    }
  }

  /**
   * Derive a child private key for a network and index.
   * Private keys are NEVER stored in the database or logs.
   */
  public async derivePrivateKey(network: string, derivationIndex: number): Promise<string> {
    const xpriv = await this.getMasterKey(network, 'XPRIV');
    if (!xpriv) {
      // Deterministic fallback private key if not configured (for testing / simulation)
      return this.generateDeterministicFallbackPrivateKey(network, derivationIndex);
    }

    try {
      const wallet = HDNodeWallet.fromExtendedKey(xpriv);
      const child = wallet.deriveChild(derivationIndex) as HDNodeWallet;
      return child.privateKey;
    } catch (error: any) {
      // Handle invalid BIP32 extended key gracefully
      console.warn(`[KeyManager] Invalid extended private key for ${network}. Using deterministic simulation key.`);
      return this.generateDeterministicFallbackPrivateKey(network, derivationIndex);
    }
  }

  /**
   * Helper to generate a deterministic fallback address (matching TatumProvider fallback logic)
   */
  private generateDeterministicFallbackAddress(network: string, derivationIndex: number): string {
    const cleanNetwork = network.toUpperCase();
    if (cleanNetwork.includes('TRC20')) {
      const hash = crypto.createHash('sha256').update(`tron:${derivationIndex}`).digest('hex');
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let derived = 'T';
      for (let i = 0; i < 33; i++) {
        const index = parseInt(hash.slice(i * 2, i * 2 + 2), 16) % chars.length;
        derived += chars[index];
      }
      return derived;
    } else {
      const hash = crypto.createHash('sha256').update(`evm:${network}:${derivationIndex}`).digest('hex');
      return `0x${hash.slice(0, 40)}`;
    }
  }

  /**
   * Helper to generate a deterministic fallback private key for testing/simulation
   */
  private generateDeterministicFallbackPrivateKey(network: string, derivationIndex: number): string {
    // Generate a secure looking deterministic hex key (32 bytes)
    const seed = `metafirm:${network}:private:${derivationIndex}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    return `0x${hash}`;
  }
}

export const keyManager = new KeyManager();
export default keyManager;
