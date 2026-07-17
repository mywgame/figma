/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Re-export common backend shared types to keep import signatures clean on the frontend
export * from '../../shared/types/index.ts';

// Add any client-only UI types here
export interface UIState {
  isSidebarOpen: boolean;
  activeTab: string;
}

export interface DashboardData {
  wallet: {
    id: string;
    availableBalance: string;
    lockedBalance: string;
    principalBalance: string;
    trialBalance: string;
    totalAssets: string;
    totalDeposited: string;
    totalWithdrawn: string;
  };
  depositAddresses: Array<{ network: string; address: string }>;
  earnings: {
    referralIncome: string;
    dailyYield: string;
    teamIncome: string;
    incentiveIncome: string;
  };
  vip: {
    tier: string;
    points: string;
    levelAValidCount: number;
    levelBcdValidCount: number;
    teamTotalCount: number;
    assignedAt: string | null;
  };
  team: {
    levelACount: number;
    levelBCount: number;
    levelCCount: number;
    levelDCount: number;
    totalReferralCount: number;
    levelAValidCount: number;
    levelBcdValidCount: number;
    teamTotalValidCount: number;
  };
  dailyClaim: {
    available: boolean;
    claimId: string | null;
    amount: string;
    windowClose: string | null;
    status: string;
  };
  recentTransactions: any[];
  recentActivities: any[];
  trialFundInfo: {
    amount: string;
    durationDays: number;
    activeTrialBalance: string;
  };
}
