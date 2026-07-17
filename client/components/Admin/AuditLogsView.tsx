/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Card, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { AUDIT_MOCK } from './mockData.ts';

interface AuditLogsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ t, isDark }) => {
  const [logs, setLogs] = useState(AUDIT_MOCK);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'All' | 'Users' | 'Deposits' | 'Withdrawals' | 'Settings'>('All');

  // Trigger Refresh
  const handleRefresh = () => {
    // TODO: Replace with real API call
    setLogs(AUDIT_MOCK);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.admin.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (moduleFilter === 'All') return true;
    return log.module === moduleFilter;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Audit Trail Logs</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Immutable records of administrative operations, password resets, and payout triggers.</p>
        </div>
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Logs
        </button>
      </div>

      {/* Table Card Container */}
      <Card className="p-0 overflow-hidden">
        {/* Controls header */}
        <div className={`p-4 border-b flex flex-col md:flex-row gap-3 items-center justify-between ${t.sep}`}>
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`} />
            <input
              type="text"
              placeholder="Search audit trail by admin, action, or IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
            />
          </div>

          {/* Module Filter buttons */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Users', 'Deposits', 'Withdrawals', 'Settings'] as const).map(tab => {
              const active = moduleFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setModuleFilter(tab)}
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

        {/* Trail Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                {['Audit Action Detail', 'Administrative Admin', 'Source IP Address', 'System Module', 'Completed Time'].map((header) => (
                  <th key={header} className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className={`transition-colors ${t.cardInner}`}>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{log.action}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{log.admin}</td>
                    <td className={`px-5 py-4 font-mono text-[10px] ${t.textMuted}`}>{log.ip}</td>
                    <td className="px-5 py-4">
                      <Badge variant={log.module === 'Withdrawals' ? 'rose' : log.module === 'Deposits' ? 'primary' : log.module === 'Users' ? 'amber' : 'neutral'}>
                        {log.module}
                      </Badge>
                    </td>
                    <td className={`px-5 py-4 font-medium ${t.textSub}`}>{log.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={`px-5 py-8 text-center font-medium ${t.textMuted}`}>
                    No audit logs match your search.
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
export default AuditLogsView;
