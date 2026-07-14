/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  ArrowDownLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';

export interface AdminDeposit {
  id: string;
  userEmail: string;
  amount: number;
  gateway: 'USDT-ERC20' | 'USD-WIRE' | 'USDC-ERC20' | 'BTC-NATIVE';
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
}

interface DepositsViewProps {
  deposits: AdminDeposit[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const DepositsView: React.FC<DepositsViewProps> = ({ deposits, onApprove, onReject }) => {
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

  const filteredDeposits = deposits.filter(d => {
    const matchesSearch = d.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                          d.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage) || 1;
  const paginatedDeposits = filteredDeposits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadgeColor = (status: AdminDeposit['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-100/50';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100/50';
    }
  };

  const getGatewayColor = (gw: AdminDeposit['gateway']) => {
    switch (gw) {
      case 'USDT-ERC20': return 'text-emerald-600 bg-emerald-50';
      case 'USDC-ERC20': return 'text-blue-600 bg-blue-50';
      case 'USD-WIRE': return 'text-indigo-600 bg-indigo-50';
      case 'BTC-NATIVE': return 'text-amber-600 bg-amber-50';
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
      
      {/* Search & Status Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between">
        <div className="relative flex-grow max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by transaction hash, email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
          />
        </div>

        <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-xl px-2 py-1">
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase px-1.5">Clearing State:</span>
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

      {/* Financial Table */}
      <TableContainer>
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/5 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Transaction ID
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/4 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  User Email
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-right w-1/6 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Amount (USD)
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-center w-[15%] shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Gateway Method
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-center w-[15%] shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Status
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/5 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Timestamp
                </th>
                <th className="sticky top-0 bg-gray-50 z-10 py-3.5 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-right w-1/6 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Operator Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                // Elegant loading skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-2/3"></div></td>
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-5/6"></div></td>
                    <td className="py-4 px-5 text-right"><div className="h-3 bg-gray-100 rounded w-1/2 ml-auto"></div></td>
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-2/3 mx-auto"></div></td>
                    <td className="py-4 px-5"><div className="h-5 bg-gray-100 rounded-full w-16 mx-auto"></div></td>
                    <td className="py-4 px-5"><div className="h-3 bg-gray-100 rounded w-3/4"></div></td>
                    <td className="py-4 px-5 text-right"><div className="h-3 bg-gray-100 rounded w-1/2 ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedDeposits.length > 0 ? (
                paginatedDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    
                    {/* Tx ID */}
                    <td className="py-3.5 px-5 font-mono text-xs text-gray-900 font-bold select-all">
                      {dep.id}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-5 font-semibold text-gray-950">
                      {dep.userEmail}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-5 text-right font-display font-extrabold text-emerald-600">
                      +${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono text-[9px] font-bold ${getGatewayColor(dep.gateway)}`}>
                        {dep.gateway}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${getStatusBadgeColor(dep.status)}`}>
                        {dep.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {dep.status === 'Rejected' && <XCircle className="w-3 h-3 text-red-500" />}
                        {dep.status === 'Pending' && <Clock className="w-3 h-3 text-amber-500 animate-pulse" />}
                        {dep.status}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-5 text-gray-400 font-mono text-[10px] font-semibold">
                      {dep.timestamp}
                    </td>

                    {/* Actions buttons */}
                    <td className="py-3.5 px-5 text-right">
                      {dep.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmAction({ id: dep.id, type: 'reject', amount: dep.amount, email: dep.userEmail })}
                            className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded-lg hover:text-red-700 transition-colors cursor-pointer"
                            title="Reject / Fail deposit row"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: dep.id, type: 'approve', amount: dep.amount, email: dep.userEmail })}
                            className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors cursor-pointer"
                            title="Confirm & Credit wallet"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-400 font-bold uppercase flex items-center justify-end gap-1 select-none">
                          <ShieldCheck className="w-3.5 h-3.5 text-gray-300" />
                          Audited
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
                      <p className="font-semibold text-gray-500">No deposit records found</p>
                      <p className="text-[10px] text-gray-400 mt-1">Try adjusting your filters or search keywords</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-gray-400">
            Showing Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({filteredDeposits.length} logs)
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
              <div className={`p-2 rounded-xl flex items-center justify-center ${confirmAction.type === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {confirmAction.type === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div className="space-y-1 flex-grow">
                <h4 className="text-sm font-display font-extrabold text-gray-950 uppercase tracking-tight">
                  {confirmAction.type === 'approve' ? 'Confirm Deposit Approval' : 'Confirm Deposit Rejection'}
                </h4>
                <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  OPERATIONAL CLEARANCE REQUIRED
                </p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">Transaction ID:</span>
                <span className="font-mono font-bold text-gray-900">{confirmAction.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">User Email:</span>
                <span className="font-semibold text-gray-900">{confirmAction.email}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-gray-100">
                <span className="text-gray-400 font-mono">Credit Amount:</span>
                <span className="font-display font-extrabold text-emerald-600">+${confirmAction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {confirmAction.type === 'approve' 
                ? 'By approving, you authorize crediting this user\'s quantitative vaults. This ledger transaction will be permanently recorded in the audit logs.'
                : 'By rejecting, this deposit will be marked as failed/rejected, and no credit will be issued to the client.'}
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
                  confirmAction.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'approve' ? 'Confirm & Credit Wallet' : 'Confirm & Fail Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
