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
  ArrowDownCircle,
  RefreshCw,
  AlertTriangle,
  Eye,
  User
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { AdminDeposit } from './types.ts';
import { api } from '../../services/api.ts';
import { formatDateTime } from '../../utils/dateFormatter.ts';
import { UserQuickProfileModal } from './Users/UserQuickProfileModal.tsx';

interface DepositsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const DepositsView: React.FC<DepositsViewProps> = ({ t, isDark }) => {
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed' | 'Rejected'>('All');
  const [search, setSearch] = useState('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);

  // Quick View User Profile state
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | undefined>(undefined);

  const handleOpenUserProfile = (dep: AdminDeposit) => {
    const target = dep.userUid || dep.userId || dep.user;
    setSelectedUserUid(target);
    setSelectedUserName(dep.user);
  };

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminDeposits({ status: filter !== 'All' ? filter : undefined });
      if (res.success && Array.isArray(res.data)) {
        setDeposits(res.data);
      } else {
        setError(res.error?.message || 'Failed to fetch deposits data.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching deposits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [filter]);

  // Handle Approve Deposit
  const approveDeposit = async (id: string) => {
    try {
      setActionProcessing(id);
      const res = await api.approveAdminDeposit(id);
      if (res.success) {
        await fetchDeposits();
      } else {
        alert(res.error?.message || 'Failed to approve deposit.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during approval.');
    } finally {
      setActionProcessing(null);
    }
  };

  // Handle Reject Deposit
  const rejectDeposit = async (id: string) => {
    try {
      setActionProcessing(id);
      const res = await api.rejectAdminDeposit(id);
      if (res.success) {
        await fetchDeposits();
      } else {
        alert(res.error?.message || 'Failed to reject deposit.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during rejection.');
    } finally {
      setActionProcessing(null);
    }
  };

  // Copy Tx Hash to Clipboard
  const copyTx = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTx(hash);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  // Filter & Search logic
  const filteredDeposits = deposits.filter(dep => {
    const matchesSearch =
      dep.user.toLowerCase().includes(search.toLowerCase()) ||
      dep.txHash.toLowerCase().includes(search.toLowerCase()) ||
      dep.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'All') return true;
    return dep.status === filter;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Deposit Audit</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Review inbound blockchain deposits, trace ledger entries, and finalize credits.</p>
        </div>
        <Button
          onClick={fetchDeposits}
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
          { l: 'Total Inbound Requests', v: deposits.length, c: 'text-blue-500' },
          { l: 'Completed Credits', v: deposits.filter(d => d.status === 'Completed').length, c: 'text-emerald-500' },
          { l: 'Awaiting Moderation', v: deposits.filter(d => d.status === 'Pending').length, c: 'text-amber-500' },
          { l: 'Rejected Notifications', v: deposits.filter(d => d.status === 'Rejected').length, c: 'text-rose-500' },
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
              placeholder="Search by username, hash, or deposit ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
            />
          </div>

          {/* Filtering tabs */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Pending', 'Completed', 'Rejected'] as const).map(tab => {
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
            <Button variant="secondary" onClick={fetchDeposits} className="px-3 py-1 text-xs">
              Retry
            </Button>
          </div>
        )}

        {/* Deposits Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                {['Deposit ID', 'User Details', 'Expected Value', 'Blockchain Method', 'Hash Reference', 'Timestamp', 'Review State'].map((header) => (
                  <th key={header} className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-xs font-medium">Fetching deposits from backend...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDeposits.length > 0 ? (
                filteredDeposits.map((dep) => (
                  <tr
                    key={dep.id}
                    onClick={() => handleOpenUserProfile(dep)}
                    className={`transition-colors cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 group/row ${t.cardInner}`}
                    title="Click row to quick-view full member profile card"
                  >
                    <td className="px-5 py-4 font-mono font-bold">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
                        {dep.displayId || dep.referenceNumber || (dep.id.length > 15 ? `DEP${dep.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}` : dep.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-900 dark:text-white group-hover/row:text-blue-500 transition-colors whitespace-nowrap">
                            {dep.user}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUserProfile(dep);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer opacity-70 group-hover/row:opacity-100"
                            title="View Full Profile Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {dep.userCustomId && (
                          <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded tracking-wide">
                            {dep.userCustomId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-extrabold font-display text-emerald-500">{dep.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                        isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-150 text-gray-700'
                      }`}>
                        <ArrowDownCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        {dep.method}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500">
                        <span className="truncate max-w-[120px]" title={dep.txHash}>{dep.txHash}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyTx(dep.txHash);
                          }}
                          className="p-1 rounded-md hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedTx === dep.txHash ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className={`px-5 py-4 font-medium ${t.textMuted}`}>
                      {(() => {
                        const formatted = formatDateTime(dep.date);
                        return (
                          <div className="flex flex-col" title={`System Time: ${formatted.utcFull} (${formatted.timeZoneAbbr})`}>
                            <span className="font-semibold text-gray-900 dark:text-white">{formatted.localDate}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{formatted.utcFull}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      {dep.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="amber">Pending</Badge>
                          <button
                            disabled={actionProcessing === dep.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              approveDeposit(dep.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                            title="Confirm Credit"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            disabled={actionProcessing === dep.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectDeposit(dep.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                            title="Reject Notice"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <Badge variant={dep.status === 'Completed' ? 'emerald' : 'rose'}>
                          {dep.status}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={`px-5 py-8 text-center font-medium ${t.textMuted}`}>
                    No deposit receipts match your filter.
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
export default DepositsView;
