/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DollarSign,
  Users,
  Award,
  CheckCircle,
  Calendar,
  X,
  Edit,
  ShieldAlert
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { SALARY_SLABS_MOCK } from './mockData.ts';

interface SalaryViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SalaryView: React.FC<SalaryViewProps> = ({ t, isDark }) => {
  const [slabs, setSlabs] = useState(SALARY_SLABS_MOCK);
  const [editingSlab, setEditingSlab] = useState<typeof SALARY_SLABS_MOCK[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Edit Salary
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlab) return;

    // TODO: Replace with real API call
    setSlabs(prev => prev.map(s => (s.rank === editingSlab.rank ? editingSlab : s)));
    setEditingSlab(null);
    showToast(`Salary slab for ${editingSlab.rank} updated successfully.`);
  };

  // Handle Process Monthly Payouts
  const triggerPayoutProcess = () => {
    setIsProcessing(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      setIsProcessing(false);
      showToast('Salary payouts successfully transmitted and processed for all ranks!');
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Leader Salary Settings</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Configure default monthly payouts, referral benchmarks, and execute payouts across member classes.</p>
        </div>
        <Button
          onClick={triggerPayoutProcess}
          loading={isProcessing}
          className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/10 border-none shrink-0"
          leftIcon={<CheckCircle className="w-4 h-4" />}
        >
          Process Monthly Payouts
        </Button>
      </div>

      {/* Grid of cards showing summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Estimated Monthly Salary Pool</p>
            <p className="text-lg font-extrabold mt-0.5">$318,400</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Qualifying Rank Leaders</p>
            <p className="text-lg font-extrabold mt-0.5">3,116 accounts</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Next Scheduled Process Date</p>
            <p className="text-lg font-extrabold mt-0.5">Aug 1, 2024</p>
          </div>
        </Card>
      </div>

      {/* Salary Slab Table */}
      <Card className="overflow-hidden">
        <div className={`p-4 border-b ${t.sep}`}>
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-500" />
            <span>Monthly Rank Slabs & Rules</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                {['Rank Class', 'Qualifying members', 'Monthly Salary payout', 'Direct referrals requirement', 'Payout Schedule', 'Configure Slab'].map((header) => (
                  <th key={header} className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10">
              {slabs.map((slab) => (
                <tr key={slab.rank} className={`transition-colors ${t.cardInner}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg select-none">
                        {slab.rank === 'Bronze' ? '🥉' : slab.rank === 'Silver' ? '🥈' : slab.rank === 'Gold' ? '🥇' : slab.rank === 'Diamond' ? '💎' : '👑'}
                      </span>
                      <span className="font-bold">{slab.rank} Level</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{slab.members.toLocaleString()} members</td>
                  <td className="px-5 py-4">
                    <Badge variant={slab.salary === '$0' ? 'neutral' : 'emerald'}>
                      {slab.salary} / month
                    </Badge>
                  </td>
                  <td className={`px-5 py-4 font-medium ${t.textSub}`}>{slab.requirement}</td>
                  <td className={`px-5 py-4 font-mono font-bold ${t.textMuted}`}>{slab.nextPayout}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setEditingSlab(slab)}
                      className="p-1.5 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Note warning card */}
      <div className="rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-left">
          <p className="font-bold">Manual Payout Process Safety Warning</p>
          <p className={`${t.textSub} leading-relaxed text-[11px]`}>
            Executing manual payouts triggers ledger deductions immediately across all users matching rank parameters. Be extremely cautious. Verify ledger balances before processing transactions.
          </p>
        </div>
      </div>

      {/* Edit Slab Modal Overlay */}
      {editingSlab && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setEditingSlab(null)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
            isDark ? 'bg-[#0f112e]' : 'bg-white'
          } ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Configure {editingSlab.rank} Payout</span>
              </h3>
              <button onClick={() => setEditingSlab(null)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <Input
                label="Monthly Salary Credit Amount"
                value={editingSlab.salary}
                onChange={e => setEditingSlab(prev => prev ? ({ ...prev, salary: e.target.value }) : null)}
                required
              />
              <Input
                label="Qualifying Downline Rule Description"
                value={editingSlab.requirement}
                onChange={e => setEditingSlab(prev => prev ? ({ ...prev, requirement: e.target.value }) : null)}
                required
              />

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setEditingSlab(null)} className="flex-1">
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

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
export default SalaryView;
