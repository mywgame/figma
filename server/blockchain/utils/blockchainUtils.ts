/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalizeAmount } from './amountUtils.ts';

/**
 * Mask the middle part of a blockchain address for privacy/display
 */
export function maskAddress(address: string, visibleLength = 6): string {
  if (!address || address.length <= visibleLength * 2) {
    return address;
  }
  return `${address.slice(0, visibleLength)}...${address.slice(-visibleLength)}`;
}

/**
 * Validate standard transaction hash formats
 */
export function isValidTxHash(txHash: string, network: string): boolean {
  if (!txHash) return false;
  
  // Accept SIM_DEP_ simulation hashes
  if (txHash.startsWith('SIM_DEP_')) return true;

  const isTron = network.toUpperCase().includes('TRC20');
  if (isTron) {
    // TRON Tx IDs are 64-character hex strings
    return /^[a-fA-F0-9]{64}$/.test(txHash);
  } else {
    // EVM hashes are 66-character hex strings starting with 0x
    return /^0x[a-fA-F0-9]{64}$/.test(txHash);
  }
}

/**
 * Standardize USDT amounts to 8 decimal places string representation
 */
export function formatUSDTAmount(amount: string | number): string {
  return normalizeAmount(amount, 8);
}
