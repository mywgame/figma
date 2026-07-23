/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Gift, DollarSign, Zap, Link as LinkIcon, Users, Award } from 'lucide-react';
import { mockDashboardData, MockIncomeCard } from '../../mocks/dashboardMockData.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { api } from '../../services/api.ts';
import { DashboardData } from '../../types/index.ts';

import { Announcements } from './Announcements.tsx';
import { DailyClaimCard } from './DailyClaimCard.tsx';
import { HeroBalanceCard } from './HeroBalanceCard.tsx';
import { IncomeStatCard } from './IncomeStatCard.tsx';
import { MonthlyEarningsChart } from './MonthlyEarningsChart.tsx';
import { NetworkLevels } from './NetworkLevels.tsx';
import { RecentActivity } from './RecentActivity.tsx';

const VIP_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  VIP1: { label: 'VIP1', color: '#94a3b8', bg: 'from-slate-400/30 to-slate-500/30', icon: '🥈' },
  VIP2: { label: 'VIP2', color: '#f59e0b', bg: 'from-yellow-500/30 to-orange-500/30', icon: '🥇' },
  VIP3: { label: 'VIP3', color: '#38bdf8', bg: 'from-cyan-500/30 to-blue-500/30', icon: '💎' },
  VIP4: { label: 'VIP4', color: '#a855f7', bg: 'from-purple-500/30 to-indigo-500/30', icon: '👑' },
  VIP5: { label: 'VIP5', color: '#ec4899', bg: 'from-pink-500/30 to-rose-500/30', icon: '🌟' },
  VIP6: { label: 'VIP6', color: '#f43f5e', bg: 'from-rose-500/30 to-red-500/30', icon: '⚡' },
  VIP7: { label: 'VIP7', color: '#10b981', bg: 'from-emerald-500/30 to-teal-500/30', icon: '🔥' },
  VIP8: { label: 'VIP8', color: '#3b82f6', bg: 'from-blue-500/30 to-cyan-500/30', icon: '🚀' },
};

interface DashboardHomeProps {
  dashboardData: DashboardData | null;
  onRefresh?: () => Promise<void>;
  onQuickAction?: (actionType: 'deposit' | 'withdraw' | 'claim' | 'team' | 'invite') => void;
}

/**
 * DASHBOARD CONTAINER (Phase 1 — UI only).
 *
 * Data flow: Dashboard Container → Mock Dashboard Data → Components via Props.
 *
 * This component owns the single `mockDashboardData` object and distributes
 * slices of it to each presentational child purely via props. No component
 * below this one embeds its own mock values — which means Phase 2 only has
 * to swap this container's data source (mock → live `/users/dashboard`
 * response) without touching any child component's internals.
 */
export const DashboardHome: React.FC<DashboardHomeProps> = ({ dashboardData, onRefresh, onQuickAction }) => {
  const { user } = useAuth();
  const data = mockDashboardData;

  if (dashboardData) {
    const totalBalance = parseFloat(dashboardData.wallet.availableBalance);
    const totalEarned = parseFloat(dashboardData.earnings.dailyYield) +
                        parseFloat(dashboardData.earnings.referralIncome) +
                        parseFloat(dashboardData.earnings.teamIncome) +
                        parseFloat(dashboardData.earnings.incentiveIncome);
    const totalWithdrawn = parseFloat(dashboardData.wallet.totalWithdrawn);

    const vipTier = dashboardData?.vip?.tier || user?.vipTier || 'VIP1';
    const currentVip = VIP_CONFIG[vipTier] || VIP_CONFIG['VIP1'];

    const levelACount = dashboardData.team?.levelACount || 0;
    const levelBCount = dashboardData.team?.levelBCount || 0;
    const levelCCount = dashboardData.team?.levelCCount || 0;
    const levelDCount = dashboardData.team?.levelDCount || 0;
    const totalMembers = levelACount + levelBCount + levelCCount + levelDCount;

    // Proportional team income distribution for the levels
    const totalTeamIncome = parseFloat(dashboardData.earnings.teamIncome);
    const l1Weight = levelACount * 10;
    const l2Weight = levelBCount * 5;
    const l3Weight = levelCCount * 3;
    const l4Weight = levelDCount * 2;
    const totalWeight = l1Weight + l2Weight + l3Weight + l4Weight;

    const getLevelEarnings = (count: number, weight: number) => {
      if (totalWeight === 0 || count === 0) return 0;
      return (weight / totalWeight) * totalTeamIncome;
    };

    const referralCode = user?.referralCode || '';
    const referralLink = referralCode ? `https://metafirm.app/ref/${referralCode}` : 'N/A';

    // Calculate seconds remaining until next UTC Midnight
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    const secondsRemaining = dashboardData.dailyClaim.available 
      ? 0 
      : Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));

    // Dynamic percent
    const percent = dashboardData.dailyClaim.available 
      ? 100 
      : Math.round((1 - secondsRemaining / 86400) * 100);

    const realDailyClaim = {
      percent: percent,
      secondsRemaining: secondsRemaining,
      rewardAmount: parseFloat(dashboardData.dailyClaim.amount),
      lastStatus: (dashboardData.dailyClaim.status === 'CLAIMED' ? 'success' : 'none') as 'success' | 'failed' | 'none',
      streakDays: dashboardData.team?.totalReferralCount > 0 ? 7 : 0, // dynamic streak fallback
      status: dashboardData.dailyClaim.status,
    };

    const realNetwork = {
      referralLink,
      commissionRate: 8,
      thisMonthEarnings: totalTeamIncome,
      totalMembers,
      levels: [
        { level: 'L1', count: levelACount, earnings: Math.round(getLevelEarnings(levelACount, l1Weight) * 100) / 100 },
        { level: 'L2', count: levelBCount, earnings: Math.round(getLevelEarnings(levelBCount, l2Weight) * 100) / 100 },
        { level: 'L3', count: levelCCount, earnings: Math.round(getLevelEarnings(levelCCount, l3Weight) * 100) / 100 },
        { level: 'L4', count: levelDCount, earnings: Math.round(getLevelEarnings(levelDCount, l4Weight) * 100) / 100 },
      ],
    };

    const realIncomeCards = [
      { key: 'dailyYield', label: 'Daily Yield', today: parseFloat(dashboardData.dailyClaim.amount), total: parseFloat(dashboardData.earnings.dailyYield), icon: Zap, accent: 'emerald' },
      { key: 'referralIncome', label: 'Referral Income', today: 0.00, total: parseFloat(dashboardData.earnings.referralIncome), icon: LinkIcon, accent: 'cyan' },
      { key: 'teamIncome', label: 'Team Income', today: 0.00, total: parseFloat(dashboardData.earnings.teamIncome), icon: Users, accent: 'purple' },
      { key: 'incentiveIncome', label: 'Incentive Income', today: 0.00, total: parseFloat(dashboardData.earnings.incentiveIncome), icon: Award, accent: 'amber' },
    ] as MockIncomeCard[];

    const realRecentTransactions = (dashboardData.recentTransactions || []).map((tx: any) => {
      const typeLower = (tx.type || 'deposit').toLowerCase();
      return {
        id: tx.id,
        type: typeLower,
        hash: tx.referenceId || `TX-${tx.id.slice(0, 8)}`,
        amount: Math.abs(parseFloat(tx.amount || '0')),
        token: 'USDT',
        time: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A',
      };
    });

    return (
      <div className="space-y-6 w-full text-left" id="metafirm-dashboard-home">

        {/* 1. Total Balance Hero Card */}
        <HeroBalanceCard
          totalBalance={totalBalance}
          totalEarned={totalEarned}
          totalWithdrawn={totalWithdrawn}
          identity={{
            name: user?.name || user?.email?.split('@')[0] || 'User',
            id: user?.userId || 'MF-N/A',
            rankLabel: currentVip.label,
            rankColor: currentVip.color,
            rankBg: currentVip.bg,
            rankIcon: currentVip.icon,
          }}
        />

        {/* 2. Quick Action Buttons — always one row (mobile shrinks size, desktop untouched) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3" id="action-buttons-container">
          <button
            onClick={() => onQuickAction?.('deposit')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Deposit</span>
          </button>
          <button
            onClick={() => onQuickAction?.('withdraw')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-900/10 active:scale-[0.98] cursor-pointer"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Withdraw</span>
          </button>
          <button
            onClick={() => onQuickAction?.('claim')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Rewards</span>
          </button>
          <button
            onClick={() => onQuickAction?.('invite')}
            className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-900/10 active:scale-[0.98] cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Task</span>
          </button>
        </div>

        {/* 3. Income Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="income-cards-container">
          {realIncomeCards.map((card) => (
            <IncomeStatCard key={card.key} label={card.label} today={card.today} total={card.total} icon={card.icon} accent={card.accent} />
          ))}
        </div>

        {/* 4. Daily Claim + Monthly Earnings Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="yield-collection-container">
          <DailyClaimCard 
            dailyClaim={realDailyClaim} 
            onClaim={async () => {
              if (dashboardData.dailyClaim.claimId) {
                const res = await api.claimYield(dashboardData.dailyClaim.claimId);
                if (res.success) {
                  if (onRefresh) await onRefresh();
                } else {
                  throw new Error(res.error?.message || 'Failed to claim daily yield');
                }
              }
            }} 
          />
          <MonthlyEarningsChart data={data.earningsHistory} />
        </div>

        {/* 5. Network Levels + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="recent-transactions-container">
          <NetworkLevels network={realNetwork} />
          <RecentActivity transactions={realRecentTransactions} onViewAll={() => onQuickAction?.('team')} />
        </div>

        {/* 6. Announcements (preserved from earlier phase; no figma equivalent) */}
        <div className="w-full" id="announcements-container">
          <Announcements />
        </div>

      </div>
    );
  }

  const fallbackVipTier = user?.vipTier || 'VIP1';
  const fallbackVip = VIP_CONFIG[fallbackVipTier] || VIP_CONFIG['VIP1'];

  return (
    <div className="space-y-6 w-full text-left" id="metafirm-dashboard-home">

      {/* 1. Total Balance Hero Card */}
      <HeroBalanceCard
        totalBalance={data.wallet.totalBalance}
        totalEarned={data.wallet.totalEarned}
        totalWithdrawn={data.wallet.totalWithdrawn}
        identity={{
          name: user?.name || user?.email?.split('@')[0] || 'User',
          id: user?.userId || 'MF-N/A',
          rankLabel: fallbackVip.label,
          rankColor: fallbackVip.color,
          rankBg: fallbackVip.bg,
          rankIcon: fallbackVip.icon,
        }}
      />

      {/* 2. Quick Action Buttons — always one row (mobile shrinks size, desktop untouched) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3" id="action-buttons-container">
        <button
          onClick={() => onQuickAction?.('deposit')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] cursor-pointer"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Deposit</span>
        </button>
        <button
          onClick={() => onQuickAction?.('withdraw')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-900/10 active:scale-[0.98] cursor-pointer"
        >
          <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Withdraw</span>
        </button>
        <button
          onClick={() => onQuickAction?.('claim')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Rewards</span>
        </button>
        <button
          onClick={() => onQuickAction?.('invite')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-sans font-bold text-[9px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-900/10 active:scale-[0.98] cursor-pointer"
        >
          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Task</span>
        </button>
      </div>

      {/* 3. Income Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="income-cards-container">
        {data.incomeCards.map((card) => (
          <IncomeStatCard key={card.key} label={card.label} today={card.today} total={card.total} icon={card.icon} accent={card.accent} />
        ))}
      </div>

      {/* 4. Daily Claim + Monthly Earnings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="yield-collection-container">
        <DailyClaimCard dailyClaim={data.dailyClaim} onClaim={() => onQuickAction?.('claim')} />
        <MonthlyEarningsChart data={data.earningsHistory} />
      </div>

      {/* 5. Network Levels + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="recent-transactions-container">
        <NetworkLevels network={data.network} />
        <RecentActivity transactions={data.recentTransactions} onViewAll={() => onQuickAction?.('team')} />
      </div>

      {/* 6. Announcements (preserved from earlier phase; no figma equivalent) */}
      <div className="w-full" id="announcements-container">
        <Announcements />
      </div>

    </div>
  );
};

export default DashboardHome;
