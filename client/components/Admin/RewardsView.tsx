/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gift, Award, TrendingUp, RefreshCw, Star, CheckCircle2 } from 'lucide-react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { Input } from '../ui/Inputs/index.tsx';

interface RewardsViewProps {
  onAuditLog: (action: string, module: 'SYSTEM_CONFIG' | 'SETTLEMENT') => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ onAuditLog }) => {
  const [bonusAmount, setBonusAmount] = useState('150');
  const [refPercentage, setRefPercentage] = useState('5.0');
  const [airdropping, setAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);

  const handleAirdrop = () => {
    setAirdropping(true);
    setAirdropSuccess(false);

    setTimeout(() => {
      setAirdropping(false);
      setAirdropSuccess(true);
      onAuditLog(`Dispatched promotional rewards airdrop campaign: $${bonusAmount} welcome bonus, ${refPercentage}% referral rate`, 'SETTLEMENT');
      setTimeout(() => setAirdropSuccess(false), 3000);
    }, 1200);
  };

  const campaigns = [
    { name: 'Summer Inbound Campaign', budget: '$100,000 USD', dispatched: '$84,150 USD', status: 'Active' },
    { name: 'VIP Referrer Airdrop', budget: '$50,000 USD', dispatched: '$12,500 USD', status: 'Active' },
    { name: 'Core Genesis Signup Match', budget: '$250,000 USD', dispatched: '$250,000 USD', status: 'Completed' }
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl">
      
      {/* Overview statistics card stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">REWARDS LIQUID POOL</span>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">$1,250,000.00</h3>
          <p className="text-[10px] font-mono text-emerald-600 font-bold">SECURED MULTI-SIG BLOCK</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">REFERRAL VALUE CONSTANT</span>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">{refPercentage}% Yield Bonus</h3>
          <p className="text-[10px] font-mono text-gray-400">APPLIED TO CAPITAL DEPOSITS</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">REGISTRATION MATCH BONUS</span>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">${bonusAmount} USD</h3>
          <p className="text-[10px] font-mono text-gray-400">WELCOMING ACCOUNT CREDITS</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Campaign compose forms */}
        <div className="md:col-span-5 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
                Dispense Rewards Campaign
              </h3>
              <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
                AIRDROP ACTIVE PROMOTIONS
              </p>
            </div>

            <Input
              label="Simulated Match Welcome Bonus (USD)"
              type="number"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              required
            />

            <Input
              label="Standard Referral Yield Boost (%)"
              type="number"
              value={refPercentage}
              onChange={(e) => setRefPercentage(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            {airdropSuccess && (
              <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Promo campaign airdrop complete!
              </span>
            )}
            <Button
              onClick={handleAirdrop}
              isLoading={airdropping}
              className="w-full text-xs font-bold py-3 rounded-2xl"
              leftIcon={<Gift className="w-3.5 h-3.5" />}
            >
              Dispatch Incentives Airdrop
            </Button>
          </div>
        </div>

        {/* Campaign ledger rows */}
        <div className="md:col-span-7 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
              Incentives Budget Allocations
            </h3>
            <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
              ACTIVE REFERRAL MARKETING PROFILES
            </p>
          </div>

          <TableContainer>
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase">Campaign</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase text-right">Budget Allocation</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase text-right">Dispatched</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {campaigns.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-bold font-display">{c.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-700 text-right">{c.budget}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-right">{c.dispatched}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-mono font-extrabold uppercase border ${
                        c.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-100/50' : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </div>

      </div>

    </div>
  );
};
