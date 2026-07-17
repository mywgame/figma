/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ArrowUpCircle
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { AdminWithdrawal } from './types.ts';
import { WITHDRAWALS_MOCK } from './mockData.ts';

interface WithdrawalsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ t, isDark }) => {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>(WITHDRAWALS_MOCK);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [search, setSearch] = useState('');
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  // Handle Approve Withdrawal
  const approveWithdrawal = (id: string) => {
    // TODO: Replace with real API call
    setWithdrawals(prev =>
      prev.map(wd => (wd.id === id ? { ...wd, status: 'Approved' as const } : wd))
    );
  };

  // Handle Reject Withdrawal
  const rejectWithdrawal = (id: string) => {
    // TODO: Replace with real API call
    setWithdrawals(prev =>
      prev.map(wd => (wd.id === id ? { ...wd, status: 'Rejected' as const } : wd))
    );
  };

  // Copy destination wallet to Clipboard
  const copyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  // Filter & Search logic
  const filteredWithdrawals = withdrawals.filter(wd => {
    const matchesSearch =
      wd.user.toLowerCase().includes(search.toLowerCase()) ||
      wd.wallet.toLowerCase().includes(search.toLowerCase()) ||
      wd.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'All') return true;
    return wd.status === filter;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Withdrawal Audit</h2>
        <p className={`text-xs mt-1 ${t.textSub}`}>Process member withdrawal requests, verify payout addresses, and authorize outgoing transactions.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Total Outbound Requests', v: withdrawals.length, c: 'text-blue-500' },
          { l: 'Authorized Disbursements', v: withdrawals.filter(w => w.status === 'Approved').length, c: 'text-emerald-500' },
          { l: 'Pending Approval', v: withdrawals.filter(w => w.status === 'Pending').length, c: 'text-amber-500' },
          { l: 'Rejected Transactions', v: withdrawals.filter(w => w.status === 'Rejected').length, c: 'text-rose-500' },
        ].map((stat) => (
          <Card key={stat.l} className="p-4 flex flex-col justify-between min-h-[90px]">
            <span className={`text-[10px] font-mono font-bold tracking-wider ${t.textMuted} uppercase`}>{stat.l}</span>
            <span className={`text-xl font-extrabold font-display leading-none mt-2 ${stat.c}`}>{stat.v}</span>
          </Card>
        ))}
      </div>

      {/* Controls and Table Container */}
      <Card className="p-0 overflow-hidden">
        <div className={`p-4 border-b flex flex-col md:flex-row gap-3 items-center justify-between ${t.sep}`}>
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`} />
            <input
              type="text"
              placeholder="Search by username, wallet, or withdrawal ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
            />
          </div>

          {/* Filtering tabs */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => {
              const active = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : `${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/8' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                {['Withdrawal ID', 'User Address', 'Debit Amount', 'Destination Wallet Address', 'Timestamp', 'Review State', 'Audit Action'].map((header) => (
                  <th key={header} className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10">
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((wd) => (
                  <tr key={wd.id} className={`transition-colors ${t.cardInner}`}>
                    <td className="px-5 py-4 font-mono font-bold text-gray-900 dark:text-white">{wd.id}</td>
                    <td className="px-5 py-4 font-semibold">{wd.user}</td>
                    <td className="px-5 py-4 font-extrabold font-display text-rose-500">{wd.amount}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate max-w-[130px]" title={wd.wallet}>{wd.wallet}</span>
                        <button
                          onClick={() => copyWallet(wd.wallet)}
                          className="p-1 rounded-md hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedWallet === wd.wallet ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className={`px-5 py-4 font-medium ${t.textMuted}`}>{wd.date}</td>
                    <td className="px-5 py-4">
                      <Badge variant={wd.status === 'Approved' ? 'emerald' : wd.status === 'Pending' ? 'amber' : 'rose'}>
                        {wd.status === 'Approved' ? 'Completed' : wd.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {wd.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveWithdrawal(wd.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 shadow-sm transition-all duration-200 cursor-pointer"
                            title="Confirm Outbound Payout"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(wd.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 shadow-sm transition-all duration-200 cursor-pointer"
                            title="Decline Request"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500/80 bg-gray-500/5 px-2.5 py-1 rounded-md border border-gray-500/10">
                          <span>Audit Settled</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={`px-5 py-8 text-center font-medium ${t.textMuted}`}>
                    No withdrawals match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default WithdrawalsView;
