/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Gift, DollarSign } from 'lucide-react';
import { mockDashboardData } from '../../mocks/dashboardMockData.ts';

import { Announcements } from './Announcements.tsx';
import { DailyClaimCard } from './DailyClaimCard.tsx';
import { HeroBalanceCard } from './HeroBalanceCard.tsx';
import { IncomeStatCard } from './IncomeStatCard.tsx';
import { MonthlyEarningsChart } from './MonthlyEarningsChart.tsx';
import { NetworkLevels } from './NetworkLevels.tsx';
import { RecentActivity } from './RecentActivity.tsx';

interface DashboardHomeProps {
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
export const DashboardHome: React.FC<DashboardHomeProps> = ({ onQuickAction }) => {
  const data = mockDashboardData;

  return (
    <div className="space-y-6 w-full text-left" id="metafirm-dashboard-home">

      {/* 1. Total Balance Hero Card */}
      <HeroBalanceCard
        totalBalance={data.wallet.totalBalance}
        totalEarned={data.wallet.totalEarned}
        totalWithdrawn={data.wallet.totalWithdrawn}
        pendingRewards={data.wallet.pendingRewards}
      />

      {/* 2. Quick Action Buttons — rectangle style, shared source of truth with mobile BottomNav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="action-buttons-container">
        <button
          onClick={() => onQuickAction?.('deposit')}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] cursor-pointer"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Deposit</span>
        </button>
        <button
          onClick={() => onQuickAction?.('withdraw')}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-900/10 active:scale-[0.98] cursor-pointer"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          <span>Withdraw</span>
        </button>
        <button
          onClick={() => onQuickAction?.('claim')}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] cursor-pointer"
        >
          <Gift className="w-4 h-4" />
          <span>Claim</span>
        </button>
        <button
          onClick={() => onQuickAction?.('invite')}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-900/10 active:scale-[0.98] cursor-pointer"
        >
          <DollarSign className="w-4 h-4" />
          <span>Invite</span>
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
