/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Zap, Shield, Search, TrendingUp, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';

export interface VipAccount {
  id: string;
  name: string;
  email: string;
  currentTier: 'None' | 'Level 1' | 'Level 2' | 'Level 3';
  totalInvestment: number;
  multiplier: number;
  status: 'Active' | 'Under Review' | 'Grace Period';
}

interface VipViewProps {
  vipAccounts: VipAccount[];
  onUpdateVip: (id: string, fields: Partial<VipAccount>) => void;
}

export const VipView: React.FC<VipViewProps> = ({ vipAccounts, onUpdateVip }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredVips = vipAccounts.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVips.length / itemsPerPage) || 1;
  const paginatedVips = filteredVips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getMultiplierColor = (tier: VipAccount['currentTier']) => {
    switch (tier) {
      case 'None': return 'text-gray-400';
      case 'Level 1': return 'text-blue-600';
      case 'Level 2': return 'text-purple-600';
      case 'Level 3': return 'text-amber-600 font-extrabold';
    }
  };

  const getStatusColor = (status: VipAccount['status']) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100/55';
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-100/55';
      case 'Grace Period': return 'bg-red-50 text-red-700 border-red-100/55';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Search Input bar */}
      <div className="relative max-w-md">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search VIP members by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
        />
      </div>

      {/* Grid summarizing elite tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">LEVEL 1 ELITE</span>
              <Award className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-display font-extrabold text-gray-950 text-base">Tier 1 Multiplier</h3>
            <p className="text-[11px] text-gray-500 leading-normal">
              Applied to balances above $5,000 USD. Grants priority clearing queues.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">Rate</span>
            <span className="text-xs font-mono font-bold text-blue-600">1.25x Yield</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-widest">LEVEL 2 PRIME</span>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="font-display font-extrabold text-gray-950 text-base">Tier 2 Multiplier</h3>
            <p className="text-[11px] text-gray-500 leading-normal">
              Applied to balances above $25,000 USD. Private OTC terminal support access.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">Rate</span>
            <span className="text-xs font-mono font-bold text-purple-600">1.50x Yield</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest">LEVEL 3 APEX</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-display font-extrabold text-gray-950 text-base">Tier 3 Multiplier</h3>
            <p className="text-[11px] text-gray-500 leading-normal">
              Applied to balances above $100,000 USD. Dedicated private banking relationship manager.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">Rate</span>
            <span className="text-xs font-mono font-bold text-amber-600">2.10x Yield</span>
          </div>
        </Card>

      </div>

      {/* Main Portfolios Table */}
      <TableContainer>
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-left w-1/4">
                Client / Email
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-center w-1/5">
                Current VIP Tier
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-right w-1/5">
                Capital Portfolios (USD)
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-center w-1/6">
                Yield Ratio
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-center w-1/6">
                Account Status
              </th>
              <th className="py-3 px-5 font-bold text-gray-400 font-mono text-[10px] tracking-wider uppercase text-right w-1/5">
                Operator Override
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedVips.length > 0 ? (
              paginatedVips.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  
                  {/* Name & Email block */}
                  <td className="py-3.5 px-5 text-left">
                    <span className="font-display font-bold text-gray-950 block">{v.name}</span>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold block">{v.email}</span>
                  </td>

                  {/* Current VIP level */}
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      v.currentTier === 'None' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                      v.currentTier === 'Level 1' ? 'bg-blue-50 text-blue-700 border-blue-100/50' :
                      v.currentTier === 'Level 2' ? 'bg-purple-50 text-purple-700 border-purple-100/50' :
                      'bg-amber-50 text-amber-700 border-amber-100/50'
                    }`}>
                      <Award className="w-2.5 h-2.5" />
                      {v.currentTier}
                    </span>
                  </td>

                  {/* Portfolio Valuation */}
                  <td className="py-3.5 px-5 text-right font-display font-extrabold text-gray-900">
                    ${v.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  {/* Multiplier ratio */}
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-xs">
                    <span className={getMultiplierColor(v.currentTier)}>
                      {v.multiplier.toFixed(2)}x
                    </span>
                  </td>

                  {/* Verification Status */}
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase border ${getStatusColor(v.status)}`}>
                      {v.status}
                    </span>
                  </td>

                  {/* Actions overrides */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <select
                        value={v.currentTier}
                        onChange={(e) => {
                          const nextTier = e.target.value as any;
                          let nextMult = 1.0;
                          if (nextTier === 'Level 1') nextMult = 1.25;
                          else if (nextTier === 'Level 2') nextMult = 1.50;
                          else if (nextTier === 'Level 3') nextMult = 2.10;
                          onUpdateVip(v.id, { currentTier: nextTier, multiplier: nextMult });
                        }}
                        className="text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 hover:border-gray-300 transition-colors cursor-pointer focus:outline-none"
                      >
                        <option value="None">None</option>
                        <option value="Level 1">Level 1</option>
                        <option value="Level 2">Level 2</option>
                        <option value="Level 3">Level 3</option>
                      </select>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 font-mono text-xs">
                  No VIP portfolio accounts matches criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableContainer>

      {/* Pagination control */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-gray-400">
            Showing Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({filteredVips.length} portfolios)
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
