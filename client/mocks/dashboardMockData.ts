/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Zap, Link as LinkIcon, Users, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * PHASE 1 — UI-ONLY MOCK DATA.
 *
 * This module is the single source of mock values for the pixel-perfect
 * Dashboard redesign. It is intentionally shaped to mirror the real
 * `DashboardData` domain (wallet, earnings, VIP/rank, daily claim, recent
 * transactions, network/referral) so that in Phase 2 this file can be
 * deleted and every field below can be replaced 1:1 by the live
 * `/users/dashboard` API response — WITHOUT changing any component, since
 * every component only ever consumes these shapes via props.
 */

export interface MockUser {
  name: string;
  uid: string;
  rank: 'Diamond' | 'Gold' | 'Silver';
  streakDays: number;
}

// Rank presentation config — mirrors the figma reference's `RANK` lookup.
export const RANK_CONFIG: Record<MockUser['rank'], { label: string; color: string; bg: string; icon: string }> = {
  Diamond: { label: 'Diamond', color: '#38bdf8', bg: 'from-cyan-500/30 to-blue-500/30', icon: '💎' },
  Gold: { label: 'Gold', color: '#f59e0b', bg: 'from-yellow-500/30 to-orange-500/30', icon: '🥇' },
  Silver: { label: 'Silver', color: '#94a3b8', bg: 'from-slate-400/30 to-slate-500/30', icon: '🥈' },
};

export interface MockIdentity {
  name: string;
  id: string;
  rankLabel: string;
  rankColor: string;
  rankBg: string;
  rankIcon: string;
  streakDays: number;
  online: boolean;
}

export interface MockWalletSummary {
  totalBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingRewards: number;
}

export type IncomeAccent = 'emerald' | 'cyan' | 'purple' | 'amber';

export interface MockIncomeCard {
  key: 'dailyYield' | 'referralIncome' | 'teamIncome' | 'incentiveIncome';
  label: string;
  today: number;
  total: number;
  icon: LucideIcon;
  accent: IncomeAccent;
}

export interface MockEarningsPoint {
  date: string;
  earnings: number;
}

export interface MockReferralLevel {
  level: string;
  count: number;
  earnings: number;
}

export interface MockNetworkSummary {
  referralLink: string;
  commissionRate: number; // percent
  thisMonthEarnings: number;
  totalMembers: number;
  levels: MockReferralLevel[];
}

export type MockTransactionType = 'deposit' | 'withdrawal' | 'commission';

export interface MockTransaction {
  id: number;
  type: MockTransactionType;
  amount: number;
  token: string;
  hash: string;
  time: string;
}

export interface MockDailyClaim {
  percent: number;
  secondsRemaining: number;
  rewardAmount: number;
  lastStatus: 'success' | 'failed' | 'none';
  streakDays: number;
}

export interface MockDashboardData {
  user: MockUser;
  wallet: MockWalletSummary;
  incomeCards: MockIncomeCard[];
  earningsHistory: MockEarningsPoint[];
  network: MockNetworkSummary;
  dailyClaim: MockDailyClaim;
  recentTransactions: MockTransaction[];
}

export const mockDashboardData: MockDashboardData = {
  user: {
    name: 'Alex Morgan',
    uid: 'MF-742D9C',
    rank: 'Diamond',
    streakDays: 14,
  },

  wallet: {
    totalBalance: 24567.89,
    totalEarned: 45678.32,
    totalWithdrawn: 21110.43,
    pendingRewards: 245.82,
  },

  incomeCards: [
    { key: 'dailyYield', label: 'Daily Yield', today: 245.82, total: 12340.50, icon: Zap, accent: 'emerald' },
    { key: 'referralIncome', label: 'Referral Income', today: 134.56, total: 8975.20, icon: LinkIcon, accent: 'cyan' },
    { key: 'teamIncome', label: 'Team Income', today: 312.10, total: 18654.80, icon: Users, accent: 'purple' },
    { key: 'incentiveIncome', label: 'Incentive Income', today: 89.44, total: 5707.82, icon: Award, accent: 'amber' },
  ],

  earningsHistory: [
    { date: 'Jan', earnings: 4500 },
    { date: 'Feb', earnings: 5200 },
    { date: 'Mar', earnings: 6800 },
    { date: 'Apr', earnings: 7100 },
    { date: 'May', earnings: 8954 },
  ],

  network: {
    referralLink: 'https://metafirm.app/ref/742d9c4a',
    commissionRate: 8,
    thisMonthEarnings: 1234.56,
    totalMembers: 1543,
    levels: [
      { level: 'L1', count: 127, earnings: 4567 },
      { level: 'L2', count: 384, earnings: 3234 },
      { level: 'L3', count: 689, earnings: 2156 },
      { level: 'L4', count: 343, earnings: 897 },
    ],
  },

  dailyClaim: {
    percent: 75,
    secondsRemaining: 6 * 3600 + 15 * 60 + 34,
    rewardAmount: 245.82,
    lastStatus: 'success',
    streakDays: 14,
  },

  recentTransactions: [
    { id: 1, type: 'deposit', amount: 500, token: 'USDT', hash: '0x7a8b...3c2d', time: '2 hours ago' },
    { id: 2, type: 'commission', amount: 234.56, token: 'USDT', hash: '0x9f4e...1a5b', time: '5 hours ago' },
    { id: 3, type: 'withdrawal', amount: 1000, token: 'USDT', hash: '0x2c8d...7e9f', time: '1 day ago' },
    { id: 4, type: 'commission', amount: 156.78, token: 'USDT', hash: '0x5b3a...9c1e', time: '1 day ago' },
    { id: 5, type: 'deposit', amount: 750, token: 'USDT', hash: '0x8e2f...4d6c', time: '2 days ago' },
  ],
};

export default mockDashboardData;

/**
 * Derived identity view for the TopNav header pill — computed from
 * `mockDashboardData.user` + `RANK_CONFIG`, so there is still only one
 * source of truth for the user's name/rank/streak (no values duplicated).
 */
export const mockIdentity: MockIdentity = {
  name: mockDashboardData.user.name,
  id: mockDashboardData.user.uid,
  rankLabel: RANK_CONFIG[mockDashboardData.user.rank].label,
  rankColor: RANK_CONFIG[mockDashboardData.user.rank].color,
  rankBg: RANK_CONFIG[mockDashboardData.user.rank].bg,
  rankIcon: RANK_CONFIG[mockDashboardData.user.rank].icon,
  streakDays: mockDashboardData.user.streakDays,
  online: true,
};
