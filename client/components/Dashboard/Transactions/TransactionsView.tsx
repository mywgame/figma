/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { SearchInput } from '../../ui/Inputs/index.tsx';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { Transaction, TransactionType } from './types.ts';
import { TransactionTable } from './TransactionTable.tsx';
import { ReceiptModal } from './ReceiptModal.tsx';
import { motion, AnimatePresence } from 'motion/react';

export const TransactionsView: React.FC = () => {
  const { t } = useTheme();
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'withdrawals' | 'claims'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Pristine high-fidelity Mock Dataset covering all requested types and status badges
  const mockTransactions: Transaction[] = [
    {
      id: 'TX-83921',
      type: 'Yield Claim',
      amount: '+$245.82',
      status: 'Completed',
      method: 'Reward Pool V2',
      date: '2026-06-28 12:45 UTC',
    },
    {
      id: 'TX-83905',
      type: 'Deposit',
      amount: '+$50,000.00',
      status: 'Completed',
      method: 'USDT ERC20',
      date: '2026-06-27 18:20 UTC',
    },
    {
      id: 'TX-83894',
      type: 'Withdrawal',
      amount: '-$12,500.00',
      status: 'Completed',
      method: 'USDC TRC20',
      date: '2026-06-27 09:14 UTC',
    },
    {
      id: 'TX-83782',
      type: 'Salary',
      amount: '+$1,500.00',
      status: 'Completed',
      method: 'Direct Deposit',
      date: '2026-06-26 00:00 UTC',
    },
    {
      id: 'TX-83741',
      type: 'Referral Income',
      amount: '+$340.50',
      status: 'Completed',
      method: 'Affiliate Credit',
      date: '2026-06-25 15:32 UTC',
    },
    {
      id: 'TX-83601',
      type: 'Reward',
      amount: '+$124.15',
      status: 'Processing',
      method: 'Staking Booster',
      date: '2026-06-24 11:05 UTC',
    },
    {
      id: 'TX-83542',
      type: 'Withdrawal',
      amount: '-$5,000.00',
      status: 'Failed',
      method: 'USDT ERC20',
      date: '2026-06-23 04:12 UTC',
    },
    {
      id: 'TX-83492',
      type: 'Deposit',
      amount: '+$12,000.00',
      status: 'Completed',
      method: 'Bank Wire Direct',
      date: '2026-06-22 10:45 UTC',
    },
    {
      id: 'TX-83410',
      type: 'Team Income',
      amount: '+$182.40',
      status: 'Completed',
      method: 'Level A Commission',
      date: '2026-06-21 21:30 UTC',
    },
    {
      id: 'TX-83390',
      type: 'Bonus',
      amount: '+$500.00',
      status: 'Pending',
      method: 'Promo Code Active',
      date: '2026-06-20 14:15 UTC',
    },
  ];

  // Handle Clipboard copies securely
  const handleCopy = (text: string, isHash: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isHash) {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filter based on tabs selection and search string
  const filteredTransactions = mockTransactions.filter((tx) => {
    // 1. Tab Filter Match
    let tabMatch = true;
    if (filterType === 'deposits') {
      tabMatch = tx.type === 'Deposit';
    } else if (filterType === 'withdrawals') {
      tabMatch = tx.type === 'Withdrawal';
    } else if (filterType === 'claims') {
      tabMatch = tx.type === 'Yield Claim' || tx.type === 'Reward';
    }

    // 2. Search Query Match
    let queryMatch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      queryMatch = 
        tx.id.toLowerCase().includes(q) || 
        tx.type.toLowerCase().includes(q) || 
        tx.method.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q);
    }

    return tabMatch && queryMatch;
  });

  return (
    <DashboardLayout
      title="Transaction History"
      description="View and track all your secure, verified blockchain wallet transactions in real-time."
    >
      <div className="space-y-6 text-left" id="transactions-view-feature-container">
        
        {/* Navigation Filters & Search bar row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Glassmorphic Sliding Tabs */}
          <div className={`flex flex-wrap gap-1 p-1 rounded-2xl border transition-all duration-300 ${t.isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'deposits', label: 'Deposits' },
              { id: 'withdrawals', label: 'Withdrawals' },
              { id: 'claims', label: 'Yield Claims' },
            ].map((btn) => {
              const isActive = filterType === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id as any)}
                  className={`relative text-[10px] xs:text-xs font-bold px-2.5 xs:px-4 py-2 sm:py-2.5 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none select-none z-10 ${
                    isActive 
                      ? t.isDark ? 'text-cyan-400' : 'text-blue-600'
                      : `${t.textSub} hover:${t.text}`
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className={`absolute inset-0 rounded-xl -z-10 border ${
                        t.isDark
                          ? 'bg-white/8 border-white/12 shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                          : 'bg-white border-black/5 shadow-xs'
                      }`}
                    />
                  )}
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Premium Search Box */}
          <div className="w-full lg:max-w-xs relative">
            <SearchInput
              placeholder="Search transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Ledger Table Component */}
        <TransactionTable
          transactions={filteredTransactions}
          onSelectTransaction={setSelectedTx}
          copiedId={copiedId}
          onCopy={(id) => handleCopy(id)}
          t={t}
        />

        {/* Audit Receipt Modal Component overlay */}
        <AnimatePresence>
          {selectedTx && (
            <ReceiptModal
              transaction={selectedTx}
              onClose={() => setSelectedTx(null)}
              copiedId={copiedId}
              copiedHash={copiedHash}
              onCopy={handleCopy}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default TransactionsView;
