/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  TrendingUp, 
  LifeBuoy, 
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { StatCard, Card, TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardHomeProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    todayRegistrations: number;
    todayDeposits: number;
    todayWithdrawals: number;
    platformBalance: string;
    todayIncome: string;
    pendingWithdrawals: number;
    pendingSupport: number;
    totalVip: number;
  };
  onNavigate: (tab: any) => void;
}

const mockChartData = [
  { name: 'Mon', Deposits: 42000, Withdrawals: 15000, Income: 4200 },
  { name: 'Tue', Deposits: 58000, Withdrawals: 22000, Income: 5800 },
  { name: 'Wed', Deposits: 61000, Withdrawals: 31000, Income: 6100 },
  { name: 'Thu', Deposits: 49000, Withdrawals: 18000, Income: 4900 },
  { name: 'Fri', Deposits: 85000, Withdrawals: 42000, Income: 8500 },
  { name: 'Sat', Deposits: 102000, Withdrawals: 65000, Income: 10200 },
  { name: 'Sun', Deposits: 92000, Withdrawals: 38000, Income: 9200 },
];

export const DashboardHome: React.FC<DashboardHomeProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-6 text-left">
      
      {/* Banner / Operational Alerts */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-100/50 text-blue-600 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-gray-900 font-display">System Integrity Checks Succeeded</h4>
            <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
              All multi-signature wallets are synchronized. HSM and KYC modules are reporting nominal latencies (8.5ms).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onNavigate('audit')} className="text-xs py-1.5 px-3 rounded-xl">
            Audit Ledger
          </Button>
        </div>
      </div>

      {/* Stats Bento Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <StatCard
          title="Platform Balance"
          value={stats.platformBalance}
          icon={<Wallet />}
          trend="+18.4% this week"
          trendDirection="up"
        />

        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users />}
          trend="+12 registrations today"
          trendDirection="up"
        />

        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<CheckCircle2 />}
          trend="84.2% engagement rate"
          trendDirection="up"
        />

        <StatCard
          title="Total VIP Members"
          value={stats.totalVip}
          icon={<Award />}
          trend="34% premium coverage"
          trendDirection="neutral"
        />

        <StatCard
          title="Today's Income"
          value={stats.todayIncome}
          icon={<TrendingUp />}
          trend="+5.3% vs yesterday"
          trendDirection="up"
        />

        <StatCard
          title="Today's Deposits"
          value={`$${stats.todayDeposits.toLocaleString()}`}
          icon={<ArrowDownLeft className="text-emerald-500" />}
          trend="Secured via ERC20 Desk"
          trendDirection="up"
        />

        <StatCard
          title="Today's Withdrawals"
          value={`$${stats.todayWithdrawals.toLocaleString()}`}
          icon={<ArrowUpRight className="text-amber-500" />}
          trend="Pending local settlement"
          trendDirection="down"
        />

        <StatCard
          title="Pending Settlement"
          value={`${stats.pendingWithdrawals} requests`}
          icon={<AlertTriangle className="text-amber-500" />}
          trend="Requires action"
          trendDirection="down"
          onClick={() => onNavigate('withdrawals')}
          className="cursor-pointer hover:border-amber-200"
        />

        <StatCard
          title="Today's Regs"
          value={`+${stats.todayRegistrations}`}
          icon={<Calendar />}
          trend="Organic acquisitions"
          trendDirection="up"
        />

        <StatCard
          title="Pending Support"
          value={`${stats.pendingSupport} tickets`}
          icon={<LifeBuoy />}
          trend="SLA: < 15 mins"
          trendDirection="neutral"
          onClick={() => onNavigate('support')}
          className="cursor-pointer hover:border-blue-200"
        />

      </div>

      {/* Middle Grid: Recharts Clearing Graph & Quick Task Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Clearing activity block */}
        <div className="lg:col-span-8 bg-white border border-gray-100/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
                Capital Settlement Clearing Volume
              </h3>
              <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
                WEEK-OVER-WEEK LEDGER BALANCING ACTIVITY
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Deposits
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Withdrawals
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: '11px', fontFamily: 'sans-serif', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }} 
                />
                <Area type="monotone" dataKey="Deposits" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDeposits)" />
                <Area type="monotone" dataKey="Withdrawals" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorWithdrawals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Desk Panel */}
        <div className="lg:col-span-4 bg-white border border-gray-100/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
                Operator Action Desk
              </h3>
              <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
                VITAL HIGH-PRIORITY BALANCING CHECKS
              </p>
            </div>

            <div className="space-y-2.5">
              
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-mono font-extrabold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">SETTLEMENT</span>
                  <p className="text-[11px] font-bold text-gray-800 leading-tight">Authorize Pending Withdrawals</p>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    {stats.pendingWithdrawals} outbound requests await cryptographic approval from root administrator keys.
                  </p>
                  <button onClick={() => onNavigate('withdrawals')} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                    <span>Manage workflow</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2.5">
                <LifeBuoy className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-mono font-extrabold uppercase text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">SUPPORT DESK</span>
                  <p className="text-[11px] font-bold text-gray-800 leading-tight">Resolve Support Queue</p>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    {stats.pendingSupport} client inquiries are outside of standard response windows.
                  </p>
                  <button onClick={() => onNavigate('support')} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                    <span>Open helpdesk</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 text-center">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
              SECURE CRYPTOGRAPHIC ENCLAVE ACTIVE
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
