/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeTokens } from '../../ui/themeTokens.ts';

export interface SweepJob {
  id: string;
  network: string;
  sourceAddress: string;
  destinationAddress: string;
  sweepType: 'USER_TO_HOT' | 'HOT_TO_COLD';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  amount: string;
  txHash: string | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
}

export interface DepositAddress {
  id: string;
  userId: string;
  network: string;
  address: string;
  onChainBalance: string;
}

export interface SweepQueueItem {
  id: string;
  depositId: string;
  userId: string;
  depositAddress: string;
  network: string;
  amount: string;
  status: 'PENDING' | 'WAITING_DELAY' | 'WAITING_GAS' | 'GAS_FUNDING' | 'READY_TO_SWEEP' | 'SWEEPING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  gasStatus: 'LOW' | 'FUNDING_SENT' | 'OK' | 'FAILED';
  gasTxHash: string | null;
  sweepTxHash: string | null;
  errorMessage: string | null;
  attempts: number;
  eligibleAt: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  nativeGasBalance: string;
}

export interface TreasuryWalletRecord {
  id?: string;
  network: string;
  walletType: 'HOT' | 'COLD';
  walletNumber: number;
  label: string;
  address: string;
  status: 'ACTIVE' | 'DISABLED';
  priority: number;
  balance?: string;
}

export interface TreasuryComponentProps {
  t: ThemeTokens;
  isDark: boolean;
}
