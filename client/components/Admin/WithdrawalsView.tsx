/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { TableContainer } from '../ui/Cards/index.tsx';

export interface AdminWithdrawal {
  id: string;
  userEmail: string;
  amount: number;
  destinationAddress: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
}

interface WithdrawalsViewProps {
  withdrawals: AdminWithdrawal[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ withdrawals, onApprove, onReject }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: 'approve' | 'reject';
    amount: number;
    email: string;
    destination: string;
  } | null>(null);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 250);
  };

  const handleFilterChange = (val: typeof statusFilter) => {
    setStatusFilter(val);
    setCurrentPage(1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 250);
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = w.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                          w.id.toLowerCase().includes(search.toLowerCase()) ||
                          w.destinationAddress.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage) || 1;
  const paginatedWithdrawals = filteredWithdrawals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadgeColor = (status: AdminWithdrawal['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-100/50';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100/50';
    }
  };

  const executeConfirmedAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      onApprove(confirmAction.id);
    } else {
      onReject(confirmAction.id);
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between">
        <div className="relative flex-grow max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, email, destination blockchain address..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
          />
        </div>

        <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-xl px-2 py-1">
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase px-1.5">Settlement State:</span>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value as any)}
            className="text-xs font-semibold text-gray-700 focus:outline-none bg-transparent cursor-pointer py-1"
          >
            <option value="All">All Transactions</option>
            <option value="Pending">Pending Audit</option>
            <option value="Approved">Approved / Cleared</option>
            <option value="Rejected">Rejected / Failed</option>
          </select>
        </div>
      </div>

      {/* Financial Settlement table */}
      <TableContainer>
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/5 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Settlement Hash
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/4 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  User Email
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-right w-1/6 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Debit Value (USD)
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-[22%] shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Destination Address
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-center w-[12%] shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Status
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/5 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Timestamp
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-right w-1/6 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-2/3"></div></td>
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-5/6"></div></td>
                    <td className="py-4 px-5 text-right"><div className="h-3 bg-gray-100 rounded w-1/2 ml-auto"></div></td>
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-3/4"></div></td>
                    <td className="py-4 px-5"><div className="h-5 bg-gray-100 rounded-full w-16 mx-auto"></div></td>
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-3/4"></div></td>
                    <td className="py-4 px-5 text-right"><div className="h-3 bg-gray-100 rounded w-1/2 ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedWithdrawals.length > 0 ? (
                paginatedWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    
                    {/* Settlement Hash */}
                    <td className="py-3.5 px-5 font-mono text-xs text-gray-900 font-bold select-all">
                      {w.id}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-5 font-semibold text-gray-950">
                      {w.userEmail}
                    </td>

                    {/* Debit Value */}
                    <td className="py-3.5 px-5 text-right font-display font-extrabold text-amber-600">
                      -${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Destination blockchain address */}
                    <td className="py-3.5 px-5 font-mono text-[11px] text-gray-500 select-all truncate max-w-[180px]" title={w.destinationAddress}>
                      {w.destinationAddress}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${getStatusBadgeColor(w.status)}`}>
                        {w.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {w.status === 'Rejected' && <XCircle className="w-3 h-3 text-red-500" />}
                        {w.status === 'Pending' && <Clock className="w-3 h-3 text-amber-500 animate-pulse" />}
                        {w.status}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-5 text-gray-400 font-mono text-[10px] font-semibold">
                      {w.timestamp}
                    </td>

                    {/* Approval Actions workflow buttons */}
                    <td className="py-3.5 px-5 text-right">
                      {w.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmAction({ id: w.id, type: 'reject', amount: w.amount, email: w.userEmail, destination: w.destinationAddress })}
                            className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded-lg hover:text-red-700 transition-colors cursor-pointer"
                            title="Reject Outbound Debit Request"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: w.id, type: 'approve', amount: w.amount, email: w.userEmail, destination: w.destinationAddress })}
                            className="px-2.5 py-1 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Authorize HSM Cryptographic Signing"
                          >
                            <Cpu className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-mono font-bold uppercase flex items-center justify-end gap-1 select-none ${w.status === 'Approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {w.status === 'Approved' ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Settled
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Rejected
                            </>
                          )}
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-mono text-xs">
                    <div className="flex flex-col items-center justify-center p-6">
                      <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-500">No withdrawal records found</p>
                      <p className="text-[10px] text-gray-400 mt-1">Try adjusting your filters or search keywords</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-gray-400">
            Showing Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({filteredWithdrawals.length} transactions)
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

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setConfirmAction(null)}
          />
          <div className="relative bg-white border border-gray-100 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in text-left">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl flex items-center justify-center ${confirmAction.type === 'approve' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                {confirmAction.type === 'approve' ? <Cpu className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div className="space-y-1 flex-grow">
                <h4 className="text-sm font-display font-extrabold text-gray-950 uppercase tracking-tight">
                  {confirmAction.type === 'approve' ? 'Confirm Cryptographic Payout' : 'Confirm Payout Rejection'}
                </h4>
                <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  CRYPTOGRAPHIC HSM ACTION REQUIRED
                </p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">Settlement Hash:</span>
                <span className="font-mono font-bold text-gray-900">{confirmAction.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">User Email:</span>
                <span className="font-semibold text-gray-900">{confirmAction.email}</span>
              </div>
              <div className="flex justify-between text-xs max-w-full">
                <span className="text-gray-400 font-mono">Destination:</span>
                <span className="font-mono text-[10px] truncate max-w-[200px] text-gray-600" title={confirmAction.destination}>{confirmAction.destination}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-gray-100">
                <span className="text-gray-400 font-mono">Debit Value:</span>
                <span className="font-display font-extrabold text-amber-600">-${confirmAction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {confirmAction.type === 'approve' 
                ? 'Approving will trigger hardware security module (HSM) multi-signature cryptographic signing to finalize this outbound blockchain transfer. This is irreversible.'
                : 'Rejecting will decline this withdrawal request and keep the funds safely locked in the system.'}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel Action
              </button>
              <button
                onClick={executeConfirmedAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all hover:shadow-md cursor-pointer ${
                  confirmAction.type === 'approve' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'approve' ? 'Authorize Cryptographic Signing' : 'Reject Outbound request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
