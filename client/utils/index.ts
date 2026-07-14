/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format raw high-precision string values into local currency formats
 */
export function formatCurrency(value: string, currency = 'USD'): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(num);
}

/**
 * Clean helper to truncate transaction hashes or wallet keys
 */
export function truncateKey(key: string, startChars = 6, endChars = 4): string {
  if (!key || key.length <= startChars + endChars) return key;
  return `${key.substring(0, startChars)}...${key.substring(key.length - endChars)}`;
}

/**
 * Calculate dates helper (standard FinTech interval support)
 */
export function getRelativeDays(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}
