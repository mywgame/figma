/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Copy, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Card, Badge, Button } from '../../ui/index.ts';
import { DepositAddress, TreasuryComponentProps } from './TreasuryTypes.ts';

interface PermanentAddressesTableProps extends TreasuryComponentProps {
  depositAddresses: DepositAddress[];
  handleSweepAddress: (id: string) => void;
  sweepingAddressId: string | null;
}

type SortOption = 'NEWEST' | 'OLDEST' | 'HIGHEST_BALANCE' | 'LOWEST_BALANCE';

const PAGE_SIZE = 30;

const formatBalance = (rawAmount: string | number | undefined): string => {
  const value = parseFloat(String(rawAmount ?? '0'));
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const PermanentAddressesTable: React.FC<PermanentAddressesTableProps> = ({
  depositAddresses,
  handleSweepAddress,
  sweepingAddressId,
  isDark,
  t,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('NEWEST');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset to page 1 whenever depositAddresses or sortOption changes
  useEffect(() => {
    setCurrentPage(1);
  }, [depositAddresses.length, sortOption]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Sorted list based on chosen option
  const sortedAddresses = useMemo(() => {
    const list = [...depositAddresses];
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
      case 'HIGHEST_BALANCE':
        return list.sort((a, b) => {
          const balA = parseFloat(a.onChainBalance || '0');
          const balB = parseFloat(b.onChainBalance || '0');
          return balB - balA;
        });
      case 'LOWEST_BALANCE':
        return list.sort((a, b) => {
          const balA = parseFloat(a.onChainBalance || '0');
          const balB = parseFloat(b.onChainBalance || '0');
          return balA - balB;
        });
      default:
        return list;
    }
  }, [depositAddresses, sortOption]);

  const totalEntries = sortedAddresses.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAddresses = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return sortedAddresses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedAddresses, safeCurrentPage]);

  const startIndexDisplay = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endIndexDisplay = Math.min(safeCurrentPage * PAGE_SIZE, totalEntries);

  return (
    <Card className={`p-0 overflow-hidden transition-all ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200/90 shadow-xs'
    }`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50/90 border-gray-200'
      }`}>
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-gray-900 dark:text-white">
            User Permanent Deposit Addresses
          </h3>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
            Real-time on-chain funds currently resting on permanent deposit addresses.
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
              <option value="HIGHEST_BALANCE">Highest Balance</option>
              <option value="LOWEST_BALANCE">Lowest Balance</option>
            </select>
          </div>

          <Badge color={totalEntries > 0 ? 'emerald' : 'amber'}>
            {totalEntries} Addresses Registered
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
              <th className="py-3 px-4">Deposit Address</th>
              <th className="py-3 px-4 text-right">Balance Rest (On-Chain)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-mono ${
            isDark ? 'divide-slate-800/80' : 'divide-gray-200'
          }`}>
            {paginatedAddresses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs font-medium font-sans">
                  No permanent deposit addresses registered yet for this network.
                </td>
              </tr>
            ) : (
              paginatedAddresses.map((addr) => {
                const balFloat = parseFloat(addr.onChainBalance || '0');
                return (
                  <tr key={addr.id} className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/80'
                  }`}>
                    <td className="py-3 px-4">
                      <div className="flex flex-col font-sans">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">
                          {addr.dsUserId || 'N/A'}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-slate-100" title={addr.userName || ''}>
                          {addr.userName || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] font-medium" title={addr.userEmail || ''}>
                          {addr.userEmail || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{addr.address}</span>
                        <button
                          onClick={() => handleCopy(addr.address, addr.id)}
                          className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 p-0.5 cursor-pointer"
                          title="Copy address"
                        >
                          {copiedText === addr.id ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">Copied</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-xs text-gray-900 dark:text-slate-100">
                      {formatBalance(addr.onChainBalance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSweepAddress(addr.id)}
                        disabled={balFloat <= 0 || sweepingAddressId === addr.id}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                          balFloat <= 0
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed opacity-50'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 shadow-xs'
                        }`}
                      >
                        {sweepingAddressId === addr.id ? 'Sweeping...' : 'Sweep Address'}
                      </button>
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
        <div className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono ${
          isDark ? 'bg-slate-950/40 border-slate-800 text-gray-400' : 'bg-gray-50/80 border-gray-200 text-gray-600'
        }`}>
          <div>
            Showing <span className="font-bold text-gray-900 dark:text-white">{startIndexDisplay}</span>–<span className="font-bold text-gray-900 dark:text-white">{endIndexDisplay}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalEntries}</span> addresses (30/page)
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
