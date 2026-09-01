/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ArrowUpCircle,
  RefreshCw,
  AlertTriangle,
  Eye,
  User
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { AdminWithdrawal } from './types.ts';
import { api } from '../../services/api.ts';
import { formatDateTime } from '../../utils/dateFormatter.ts';
import { UserQuickProfileModal } from './Users/UserQuickProfileModal.tsx';

interface WithdrawalsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ t, isDark }) => {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [search, setSearch] = useState('');
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);

  // Quick View User Profile state
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | undefined>(undefined);

  const handleOpenUserProfile = (wd: AdminWithdrawal) => {
    const target = wd.userUid || wd.userId || wd.user;
    setSelectedUserUid(target);
    setSelectedUserName(wd.user);
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminWithdrawals({ status: filter !== 'All' ? filter : undefined });
      if (res.success && Array.isArray(res.data)) {
        setWithdrawals(res.data);
      } else {
        setError(res.error?.message || 'Failed to fetch withdrawals data.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching withdrawals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  // Handle Approve Withdrawal
  const approveWithdrawal = async (id: string) => {
    try {
      setActionProcessing(id);
      const res = await api.approveAdminWithdrawal(id);
      if (res.success) {
        await fetchWithdrawals();
      } else {
        alert(res.error?.message || 'Failed to approve withdrawal.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during approval.');
    } finally {
      setActionProcessing(null);
    }
  };

  // Handle Reject Withdrawal
  const rejectWithdrawal = async (id: string) => {
    try {
      setActionProcessing(id);
      const res = await api.rejectAdminWithdrawal(id);
      if (res.success) {
        await fetchWithdrawals();
      } else {
        alert(res.error?.message || 'Failed to reject withdrawal.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during rejection.');
    } finally {
      setActionProcessing(null);
    }
  };

  // Handle Verify & Finalize On-Chain Withdrawal
  const verifyWithdrawal = async (id: string) => {
    try {
      setActionProcessing(id);
      const res = await api.verifyAdminWithdrawal(id);
      if (res.success) {
        await fetchWithdrawals();
      } else {
        alert(res.error?.message || 'Failed to verify on-chain status.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during verification.');
    } finally {
      setActionProcessing(null);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Withdrawal Audit</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Process member withdrawal requests, verify payout addresses, and authorize outgoing transactions.</p>
        </div>
        <Button
          onClick={fetchWithdrawals}
          variant="secondary"
          className="flex items-center gap-1.5 px-3 py-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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

        {/* Error Alert State */}
        {error && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-500 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <Button variant="secondary" onClick={fetchWithdrawals} className="px-3 py-1 text-xs">
              Retry
            </Button>
          </div>
        )}

        {/* Withdrawals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                {['Withdrawal ID', 'User details', 'Debit Amount', 'Destination Wallet Address', 'Timestamp', 'Review State'].map((header) => (
                  <th key={header} className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-xs font-medium">Fetching withdrawals from backend...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((wd) => (
                  <tr
                    key={wd.id}
                    onClick={() => handleOpenUserProfile(wd)}
                    className={`transition-colors cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 group/row ${t.cardInner}`}
                    title="Click row to quick-view full member profile card"
                  >
                    <td className="px-5 py-4 font-mono font-bold">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
                        {wd.displayId || wd.reference || (wd.id.length > 15 ? `WD${wd.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}` : wd.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-900 dark:text-white group-hover/row:text-blue-500 transition-colors whitespace-nowrap">
                            {wd.user}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUserProfile(wd);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer opacity-70 group-hover/row:opacity-100"
                            title="View Full Profile Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {wd.userCustomId && (
                          <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded tracking-wide">
                            {wd.userCustomId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-extrabold font-display text-rose-500">{wd.amount}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate max-w-[130px]" title={wd.wallet}>{wd.wallet}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyWallet(wd.wallet);
                          }}
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
                    <td className={`px-5 py-4 font-medium ${t.textMuted}`}>
                      {(() => {
                        const formatted = formatDateTime(wd.date);
                        return (
                          <div className="flex flex-col" title={`System Time: ${formatted.utcFull} (${formatted.timeZoneAbbr})`}>
                            <span className="font-semibold text-gray-900 dark:text-white">{formatted.localDate}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{formatted.utcFull}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      {wd.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="amber">Pending</Badge>
                          <button
                            disabled={actionProcessing === wd.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              approveWithdrawal(wd.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                            title="Confirm Outbound Payout"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            disabled={actionProcessing === wd.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectWithdrawal(wd.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                            title="Decline Request"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              wd.status === 'Completed' || wd.status === 'COMPLETED'
                                ? 'emerald'
                                : wd.status === 'Processing' || wd.status === 'PROCESSING' || wd.status === 'Approved'
                                ? 'blue'
                                : 'rose'
                            }
                          >
                            {wd.status === 'Processing' || wd.status === 'PROCESSING'
                              ? 'Processing'
                              : wd.status === 'Approved'
                              ? 'Completed'
                              : wd.status}
                          </Badge>
                          {(wd.status === 'Processing' || wd.status === 'PROCESSING') && (
                            <button
                              disabled={actionProcessing === wd.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyWithdrawal(wd.id);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-500 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                              title="Verify on-chain status & finalize"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${actionProcessing === wd.id ? 'animate-spin' : ''}`} />
                              <span>Verify</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={`px-5 py-8 text-center font-medium ${t.textMuted}`}>
                    No withdrawals match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick View Member Profile Card Modal */}
      <UserQuickProfileModal
        userId={selectedUserUid}
        userName={selectedUserName}
        isOpen={!!selectedUserUid}
        onClose={() => {
          setSelectedUserUid(null);
          setSelectedUserName(undefined);
        }}
        t={t}
      />
    </div>
  );
};
export default WithdrawalsView;
