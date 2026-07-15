/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';

interface HeroBalanceCardProps {
  totalBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

/**
 * Total Balance hero card — pixel-matched to the figma reference dashboard.
 * Every displayed value arrives via props; no mock data is embedded here,
 * so this component is ready to be fed real `dashboardData.wallet.*` in Phase 2.
 */
export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  totalBalance,
  totalEarned,
  totalWithdrawn,
}) => {
  const { t } = useTheme();

  const subStats = [
    { label: 'Total Earned', value: fmt(totalEarned), color: 'text-emerald-500', Icon: TrendingUp },
    { label: 'Total Withdrawn', value: fmt(totalWithdrawn), color: 'text-red-400', Icon: ArrowUpRight },
  ];

  return (
    <div className={`relative backdrop-blur-xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`} id="total-balance-card">
      {/* Decorative glow blobs */}
      <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-cyan-500/20' : 'bg-violet-400/20'}`} />
      <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${t.isDark ? 'bg-purple-600/20' : 'bg-sky-400/20'}`} />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-7 py-6">
        {/* Left: label + big number */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-xl ${t.isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/15'}`}>
              <DollarSign className="w-5 h-5 text-cyan-500" />
            </div>
            <span className={`text-sm font-semibold uppercase tracking-widest ${t.textSub}`}>Total Balance</span>
          </div>
          <p className={`text-5xl sm:text-6xl font-extrabold tracking-tight leading-none ${t.text}`}>
            $<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p className={`text-sm mt-2 ${t.textSub}`}>USDT · MetaFirm Wallet</p>
        </div>

        {/* Right: sub-stats card */}
        <div className={`flex-shrink-0 w-full sm:w-auto rounded-2xl border px-5 py-4 backdrop-blur-sm transition-all duration-300 ${t.isDark ? 'bg-white/5 border-white/10' : 'bg-black/4 border-black/8'}`}>
          <div className="grid grid-cols-2 gap-0">
            {subStats.map(({ label, value, color, Icon }, i) => (
              <div key={label} className={`flex flex-col items-center text-center px-4 ${i > 0 ? `border-l ${t.sep}` : ''}`}>
                <div className={`p-1.5 rounded-lg mb-2 ${t.isDark ? 'bg-white/8' : 'bg-black/6'}`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <p className={`text-base font-extrabold ${color}`}>{value}</p>
                <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${t.textMuted}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBalanceCard;
