/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, ChevronRight, ChevronLeft, Copy, ArrowUpDown } from 'lucide-react';
import { Card, Badge } from '../../ui/index.ts';
import { SweepJob, TreasuryComponentProps } from './TreasuryTypes.ts';

interface SweepAuditLogsTableProps extends TreasuryComponentProps {
  jobs: SweepJob[];
  handleRetryJob: (id: string) => void;
  retryingJobId: string | null;
}

type SortOption = 'NEWEST' | 'OLDEST' | 'HIGHEST_AMOUNT' | 'LOWEST_AMOUNT';

const PAGE_SIZE = 30;

const formatAuditAmount = (rawAmount: string | number | undefined): string => {
  const value = parseFloat(String(rawAmount ?? '0'));
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const SweepAuditLogsTable: React.FC<SweepAuditLogsTableProps> = ({
  jobs,
  handleRetryJob,
  retryingJobId,
  isDark,
  t,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('NEWEST');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page when jobs change or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [jobs.length, sortOption]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sortedJobs = useMemo(() => {
    const list = [...jobs];
    switch (sortOption) {
      case 'NEWEST':
        return list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      case 'OLDEST':
        return list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeA - timeB;
        });
      case 'HIGHEST_AMOUNT':
        return list.sort((a, b) => {
          const amtA = parseFloat(a.amount || '0');
          const amtB = parseFloat(b.amount || '0');
          return amtB - amtA;
        });
      case 'LOWEST_AMOUNT':
        return list.sort((a, b) => {
          const amtA = parseFloat(a.amount || '0');
          const amtB = parseFloat(b.amount || '0');
          return amtA - amtB;
        });
      default:
        return list;
    }
  }, [jobs, sortOption]);

  const totalEntries = sortedJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedJobs = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return sortedJobs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedJobs, safeCurrentPage]);

  const startIndexDisplay = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endIndexDisplay = Math.min(safeCurrentPage * PAGE_SIZE, totalEntries);

  return (
    <Card className={`p-0 overflow-hidden flex flex-col transition-all ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200/90 shadow-xs'
    }`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50/90 border-gray-200'
      }`}>
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 text-gray-900 dark:text-white">
            <FileText className="w-4 h-4 text-blue-500" />
            Historical Sweep Audit Logs (Idempotent Jobs)
          </h3>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
            Full cryptographic ledger records of previous and pending sweep transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Sort:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className={`text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 border transition-colors outline-hidden cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-gray-200 hover:border-slate-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 shadow-xs'
              }`}
            >
              <option value="NEWEST">Newest to Oldest</option>
              <option value="OLDEST">Oldest to Newest</option>
              <option value="HIGHEST_AMOUNT">Highest Amount</option>
              <option value="LOWEST_AMOUNT">Lowest Amount</option>
            </select>
          </div>

          <Badge color={totalEntries > 0 ? 'purple' : 'gray'}>
            {totalEntries} Audit Logs
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs font-mono font-bold tracking-wider uppercase border-b ${
              isDark ? 'bg-slate-900/80 text-gray-400 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Job ID</th>
              <th className="py-3 px-4">Operation</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Source → Destination</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Tx Hash / Error</th>
              <th className="py-3 px-4 text-center">Trigger</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-mono ${
            isDark ? 'divide-slate-800/80' : 'divide-gray-200'
          }`}>
            {paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs font-medium font-sans">
                  No sweep jobs processed for this network yet.
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job) => {
                const isSystemJob = job.sweepType === 'HOT_TO_COLD';
                return (
                  <tr key={job.id} className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/80'
                  }`}>
                    <td className="py-3 px-4">
                      <div className="flex flex-col font-sans">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">
                          {isSystemJob ? 'SYSTEM' : job.dsUserId || 'N/A'}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                          {isSystemJob ? 'Treasury System' : job.userName || 'N/A'}
                        </span>
                        <span
                          className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px] font-medium"
                          title={isSystemJob ? 'system@treasury' : job.userEmail || 'N/A'}
                        >
                          {isSystemJob ? 'system@treasury' : job.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold font-mono text-gray-600 dark:text-gray-400">
                      {job.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={job.sweepType === 'USER_TO_HOT' ? 'blue' : 'purple'}>
                        {job.sweepType === 'USER_TO_HOT' ? 'USER → HOT' : 'HOT → COLD'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-slate-100 font-extrabold text-xs">
                      {formatAuditAmount(job.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs font-mono text-gray-700 dark:text-gray-300">
                        <span className="truncate max-w-[90px] font-medium" title={job.sourceAddress}>
                          {job.sourceAddress}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[90px] font-medium" title={job.destinationAddress}>
                          {job.destinationAddress}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold leading-none ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : job.status === 'IN_PROGRESS' || job.status === 'AWAITING_CONFIRMATION'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 animate-pulse'
                            : job.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-xs">
                      {job.status === 'COMPLETED' || job.txHash ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-700 dark:text-gray-300 truncate font-mono text-xs font-medium">{job.txHash}</span>
                          <button
                            onClick={() => handleCopy(job.txHash || '', job.id)}
                            className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 shrink-0 p-0.5 cursor-pointer"
                            title="Copy transaction hash"
                          >
                            {copiedText === job.id ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">Copied</span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : job.errorMessage ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold font-sans text-xs" title={job.errorMessage}>
                          {job.errorMessage}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {job.status === 'FAILED' ? (
                        <button
                          onClick={() => handleRetryJob(job.id)}
                          disabled={retryingJobId === job.id}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer shadow-xs"
                        >
                          {retryingJobId === job.id ? 'Retrying...' : 'Retry Job'}
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalEntries > 0 && (
        <div className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono shrink-0 ${
          isDark ? 'bg-slate-950/40 border-slate-800 text-gray-400' : 'bg-gray-50/80 border-gray-200 text-gray-600'
        }`}>
          <div>
            Showing <span className="font-bold text-gray-900 dark:text-white">{startIndexDisplay}</span>–<span className="font-bold text-gray-900 dark:text-white">{endIndexDisplay}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalEntries}</span> audit logs (30/page)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors ${
                safeCurrentPage <= 1
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : isDark
                    ? 'hover:bg-slate-800 border-slate-700 text-gray-200 cursor-pointer'
                    : 'hover:bg-white border-gray-300 text-gray-700 cursor-pointer shadow-xs'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>

            <span className="px-2 font-semibold text-gray-800 dark:text-gray-200">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors ${
                safeCurrentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : isDark
                    ? 'hover:bg-slate-800 border-slate-700 text-gray-200 cursor-pointer'
                    : 'hover:bg-white border-gray-300 text-gray-700 cursor-pointer shadow-xs'
              }`}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
