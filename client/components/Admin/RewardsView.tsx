/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Activity,
  Award,
  DollarSign
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';

interface RewardCampaign {
  id: string;
  title: string;
  bonusAmount: string;
  minDepRequired: string;
  claimsCount: number;
  status: 'Active' | 'Paused';
  description: string;
}

const INITIAL_CAMPAIGNS: RewardCampaign[] = [
  { id: 'CAMP-01', title: 'Welcome Registration Bonus',   bonusAmount: '$10',  minDepRequired: '$0',      claimsCount: 1428, status: 'Active', description: 'Credit upon verified user profile registration.' },
  { id: 'CAMP-02', title: 'First Deposit Match Incentive', bonusAmount: '$50',  minDepRequired: '$500',    claimsCount: 892,  status: 'Active', description: 'Matched bonus credit applied once deposit completes.' },
  { id: 'CAMP-03', title: 'Annual Anniversary Reward',     bonusAmount: '$200', minDepRequired: '$2,000',  claimsCount: 42,   status: 'Paused', description: 'Special reward distributed to accounts active over 1 year.' },
];

interface RewardsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ t, isDark }) => {
  const [campaigns, setCampaigns] = useState<RewardCampaign[]>(INITIAL_CAMPAIGNS);
  const [editingCampaign, setEditingCampaign] = useState<RewardCampaign | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Omit<RewardCampaign, 'id' | 'claimsCount'>>({
    title: '',
    bonusAmount: '',
    minDepRequired: '',
    status: 'Active',
    description: ''
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle status
  const toggleCampaignStatus = (id: string) => {
    // TODO: Replace with real API call
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newStatus = c.status === 'Active' ? 'Paused' as const : 'Active' as const;
          showToast(`Campaign ${c.title} state changed to ${newStatus}.`);
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  // Edit campaign save
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    // TODO: Replace with real API call
    setCampaigns(prev => prev.map(c => (c.id === editingCampaign.id ? editingCampaign : c)));
    setEditingCampaign(null);
    showToast('Promotion settings saved successfully.');
  };

  // Create new campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `CAMP-0${campaigns.length + 1}`;
    const created: RewardCampaign = {
      ...newCampaign,
      id,
      claimsCount: 0
    };

    // TODO: Replace with real API call
    setCampaigns(prev => [...prev, created]);
    setIsAddOpen(false);
    setNewCampaign({
      title: '',
      bonusAmount: '',
      minDepRequired: '',
      status: 'Active',
      description: ''
    });
    showToast(`Promotion campaign ${created.title} created.`);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Incentives & Campaigns</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Design welcome incentives, deposit matching milestones, and promotional reward claims rules.</p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="sm:self-center flex items-center gap-1.5 self-start"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Campaign
        </Button>
      </div>

      {/* Grid of Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="p-5 flex flex-col justify-between min-h-[220px]">
            {/* Top Row */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${t.inset}`}>
                    <Gift className="w-4 h-4 text-purple-500 shrink-0" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">{camp.id}</span>
                </div>
                <Badge variant={camp.status === 'Active' ? 'emerald' : 'neutral'}>
                  {camp.status}
                </Badge>
              </div>

              {/* Title & Description */}
              <div className="mt-3.5 space-y-1">
                <h4 className="font-display font-bold text-sm tracking-tight">{camp.title}</h4>
                <p className={`text-[11px] leading-relaxed line-clamp-2 ${t.textSub}`}>{camp.description}</p>
              </div>

              {/* Rules highlights inside card */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className={`p-2 rounded-xl text-left ${t.inset}`}>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Bonus Reward</span>
                  <p className="text-sm font-extrabold text-purple-400">{camp.bonusAmount}</p>
                </div>
                <div className={`p-2 rounded-xl text-left ${t.inset}`}>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${t.textMuted}`}>Min Deposit</span>
                  <p className="text-sm font-extrabold">{camp.minDepRequired}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className={`flex items-center justify-between border-t mt-4 pt-3.5 ${t.sep}`}>
              <div className={`text-[10px] font-mono font-bold ${t.textMuted}`}>
                {camp.claimsCount.toLocaleString()} claims processed
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleCampaignStatus(camp.id)}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    camp.status === 'Active' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                  }`}
                  title={camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                >
                  {camp.status === 'Active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setEditingCampaign(camp)}
                  className="p-1.5 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                  title="Edit Campaign Settings"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Campaign Modal Overlay */}
      {editingCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setEditingCampaign(null)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
            isDark ? 'bg-[#0f112e]' : 'bg-white'
          } ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-500" />
                <span>Configure Promotion Settings</span>
              </h3>
              <button onClick={() => setEditingCampaign(null)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <Input
                label="Campaign Title"
                value={editingCampaign.title}
                onChange={e => setEditingCampaign(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                required
              />
              <Input
                label="Campaign Description"
                value={editingCampaign.description}
                onChange={e => setEditingCampaign(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Bonus Credit Amount"
                  value={editingCampaign.bonusAmount}
                  onChange={e => setEditingCampaign(prev => prev ? ({ ...prev, bonusAmount: e.target.value }) : null)}
                  required
                />
                <Input
                  label="Minimum Deposit Threshold"
                  value={editingCampaign.minDepRequired}
                  onChange={e => setEditingCampaign(prev => prev ? ({ ...prev, minDepRequired: e.target.value }) : null)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setEditingCampaign(null)} className="flex-1">
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

      {/* Add Campaign Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsAddOpen(false)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
            isDark ? 'bg-[#0f112e]' : 'bg-white'
          } ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Create Campaign promotion</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <Input
                label="Campaign Title"
                placeholder="e.g. Autumn Bonus Match"
                value={newCampaign.title}
                onChange={e => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Input
                label="Campaign Description"
                placeholder="Describe rules or claim criteria..."
                value={newCampaign.description}
                onChange={e => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Bonus Credit (USD)"
                  placeholder="e.g. $25"
                  value={newCampaign.bonusAmount}
                  onChange={e => setNewCampaign(prev => ({ ...prev, bonusAmount: e.target.value }))}
                  required
                />
                <Input
                  label="Min Deposit (USD)"
                  placeholder="e.g. $250"
                  value={newCampaign.minDepRequired}
                  onChange={e => setNewCampaign(prev => ({ ...prev, minDepRequired: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Add Campaign
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
export default RewardsView;
