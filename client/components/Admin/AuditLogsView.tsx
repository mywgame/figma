/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, ChevronLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
import { TableContainer } from '../ui/Cards/index.tsx';

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  module: 'AUTH' | 'SETTLEMENT' | 'VIP_PROMO' | 'SECURITY' | 'SYSTEM_CONFIG';
  timestamp: string;
  ipAddress: string;
}

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'All' | AuditLog['module']>('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
                          l.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
                          l.id.toLowerCase().includes(search.toLowerCase()) ||
                          l.ipAddress.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'All' || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getModuleBadge = (mod: AuditLog['module']) => {
    switch (mod) {
      case 'AUTH': return 'bg-blue-50 text-blue-700 border-blue-100/50';
      case 'SETTLEMENT': return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'VIP_PROMO': return 'bg-purple-50 text-purple-700 border-purple-100/50';
      case 'SECURITY': return 'bg-rose-50 text-rose-700 border-rose-100/50';
      case 'SYSTEM_CONFIG': return 'bg-amber-50 text-amber-700 border-amber-100/50';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Search & filters bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between">
        <div className="relative flex-grow max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search action descriptions, admin emails, operator IPs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
          />
        </div>

        <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-xl px-2 py-1">
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase px-1.5">Console Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold text-gray-700 focus:outline-none bg-transparent cursor-pointer py-1"
          >
            <option value="All">All Modules</option>
            <option value="AUTH">AUTH (Access Logs)</option>
            <option value="SETTLEMENT">SETTLEMENT (Accounting)</option>
            <option value="VIP_PROMO">VIP_PROMO (Client Promotion)</option>
            <option value="SECURITY">SECURITY (Zero-Trust events)</option>
            <option value="SYSTEM_CONFIG">SYSTEM_CONFIG (Settings)</option>
          </select>
        </div>
      </div>

      {/* Cryptographic Ledger Table */}
      <TableContainer>
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/5">
                Cryptographic ID / Hash
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-[18%]">
                Operator Email
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-center w-1/6">
                Module Block
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/3">
                Action / Payload Details
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/6">
                Operator IP
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/5">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  
                  {/* Ledger Row Hash */}
                  <td className="py-3 px-5 font-mono text-[11px] text-gray-400 select-all font-bold">
                    {log.id}
                  </td>

                  {/* Admin email */}
                  <td className="py-3 px-5 text-gray-900 font-semibold text-[11px]">
                    {log.adminEmail}
                  </td>

                  {/* Module Badge */}
                  <td className="py-3 px-5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded font-mono text-[8px] font-bold border ${getModuleBadge(log.module)}`}>
                      {log.module}
                    </span>
                  </td>

                  {/* Action Description */}
                  <td className="py-3 px-5 text-gray-700 font-medium font-sans">
                    {log.action}
                  </td>

                  {/* Operator IP */}
                  <td className="py-3 px-5 font-mono text-[11px] text-gray-500">
                    {log.ipAddress}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-5 text-gray-400 font-mono text-[10px] font-semibold">
                    {log.timestamp}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 font-mono text-xs">
                  No cryptographic logs match query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableContainer>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-gray-400">
            Showing Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({filteredLogs.length} ledger events)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
