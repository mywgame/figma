/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Percent,
  Plus,
  Trash2,
  Edit,
  X,
  PlusCircle,
  Gem
} from 'lucide-react';
import { Card, Button, Input, Select } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { VIP_TIERS_MOCK } from './mockData.ts';

interface VipViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const VipView: React.FC<VipViewProps> = ({ t, isDark }) => {
  const [tiers, setTiers] = useState(VIP_TIERS_MOCK);
  const [selectedTier, setSelectedTier] = useState<typeof VIP_TIERS_MOCK[0] | null>(null);

  // Handle Edit Tier
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    
    // TODO: Replace with real API call
    setTiers(prev => prev.map(t => (t.name === selectedTier.name ? selectedTier : t)));
    setSelectedTier(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">VIP Management</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Design class configurations, edit compound yield percentages, and view level distributions.</p>
        </div>
      </div>

      {/* Grid List of Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tiers.map((tier) => {
          const boxBgClass = isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white/60 border-black/5';
          const labelClass = isDark ? 'text-white/70' : 'text-slate-700 font-semibold';
          const valueClass = isDark ? 'text-white' : 'text-slate-900';

          return (
            <div
              key={tier.name}
              className={`rounded-3xl border p-5 bg-gradient-to-br flex flex-col justify-between min-h-[260px] relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${tier.color}`}
            >
              {/* Top Row: Name and Icon */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl select-none">{tier.icon}</span>
                    <span className="text-base font-extrabold font-display leading-none tracking-tight">{tier.name} Tier</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${t.inset}`}>
                    {tier.badge}
                  </span>
                </div>

                {/* Daily DPY Rate Header Box */}
                <div className={`mt-4 p-3 rounded-2xl border flex items-center justify-between ${boxBgClass}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${labelClass}`}>Daily DPY Rate</span>
                  <span className="text-lg font-extrabold font-display text-emerald-500 dark:text-emerald-400">{tier.dailyYield}</span>
                </div>

                {/* Requirements Grid inside Card */}
                <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                  <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Wallet Req</p>
                    <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.walletReq}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Level A (Direct)</p>
                    <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.levelAReq}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Level B+C+D</p>
                    <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.levelBCDReq}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl border text-left ${boxBgClass}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${labelClass}`}>Team Total</p>
                    <p className={`text-xs font-extrabold font-display mt-0.5 ${valueClass}`}>{tier.teamTotal}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Active users counter and Edit button */}
              <div className={`flex items-center justify-between border-t pt-3.5 mt-4 ${isDark ? 'border-white/10' : 'border-slate-200/50'}`}>
                <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-white/75' : 'text-slate-600'}`}>
                  <Users className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-slate-400'}`} />
                  <span className="font-bold">{tier.members.toLocaleString()} active members</span>
                </div>
                <button
                  onClick={() => setSelectedTier(tier)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                    isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-black/5 hover:bg-black/10 text-slate-800'
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Tier configuration Overlay Modal */}
      {selectedTier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedTier(null)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
            isDark ? 'bg-[#0f112e] text-white' : 'bg-white text-slate-900'
          } ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Configure {selectedTier.name} VIP</span>
              </h3>
              <button onClick={() => setSelectedTier(null)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <Input
                label="Wallet Requirement (USDT)"
                value={selectedTier.walletReq}
                onChange={e => setSelectedTier(prev => prev ? ({ ...prev, walletReq: e.target.value }) : null)}
                required
              />
              <Input
                label="Daily DPY Rate"
                placeholder="e.g. 1.20%"
                value={selectedTier.dailyYield}
                onChange={e => setSelectedTier(prev => prev ? ({ ...prev, dailyYield: e.target.value }) : null)}
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Level A"
                  placeholder="e.g. 3"
                  value={selectedTier.levelAReq}
                  onChange={e => setSelectedTier(prev => prev ? ({ ...prev, levelAReq: e.target.value }) : null)}
                  required
                />
                <Input
                  label="Level B+C+D"
                  placeholder="e.g. 6"
                  value={selectedTier.levelBCDReq}
                  onChange={e => setSelectedTier(prev => prev ? ({ ...prev, levelBCDReq: e.target.value }) : null)}
                  required
                />
                <Input
                  label="Team Total"
                  placeholder="e.g. 9"
                  value={selectedTier.teamTotal}
                  onChange={e => setSelectedTier(prev => prev ? ({ ...prev, teamTotal: e.target.value }) : null)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setSelectedTier(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default VipView;
