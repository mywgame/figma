/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Mail,
  Wallet,
  Shield,
  HelpCircle,
  Save,
  Info
} from 'lucide-react';
import { Card, Button, Input } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';

interface SettingsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ t, isDark }) => {
  const [platformName, setPlatformName] = useState('MetaFirm');
  const [supportEmail, setSupportEmail] = useState('operations@metafirm.app');
  const [minDeposit, setMinDeposit] = useState('100');
  const [minWithdrawal, setMinWithdrawal] = useState('50');
  const [withdrawalFee, setWithdrawalFee] = useState('2.5');
  const [baseRefBonus, setBaseRefBonus] = useState('5.0');
  
  const [isToastOpen, setIsToastOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real API call
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 3000);
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Platform Configurations</h2>
        <p className={`text-xs mt-1 ${t.textSub}`}>Configure default operational nameplates, financial thresholds, withdrawal tax fees, and support emails.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Settings Inputs */}
        <Card className="lg:col-span-8 p-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Subsection 1: Branding Branding */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>General Configurations & Branding</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Platform Identity Name"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                  required
                />
                <Input
                  label="Inbound Support Dispatch Email"
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Subsection 2: Financial minimums */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-500" />
                <span>Transaction Limits & Thresholds</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Minimum Deposit Size Threshold (USD)"
                  type="number"
                  value={minDeposit}
                  onChange={e => setMinDeposit(e.target.value)}
                  required
                />
                <Input
                  label="Minimum Withdrawal Size Threshold (USD)"
                  type="number"
                  value={minWithdrawal}
                  onChange={e => setMinWithdrawal(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Subsection 3: Withdrawal fees */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-500" />
                <span>Financial Ledger Charges</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Withdrawal Processing Fee Percentage (%)"
                  type="number"
                  step="0.01"
                  value={withdrawalFee}
                  onChange={e => setWithdrawalFee(e.target.value)}
                  required
                />
                <Input
                  label="Fallback Base Referral Bonus (%)"
                  type="number"
                  step="0.01"
                  value={baseRefBonus}
                  onChange={e => setBaseRefBonus(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Save Configurations
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Info card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4 text-xs">
            <h4 className="font-display font-bold text-xs flex items-center gap-2 text-blue-500 uppercase tracking-wider">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Settings Guidelines</span>
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="font-bold">Transaction Size Limits</span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>Prevents high-frequency microtransactions from clogging cold wallet nodes and inflating fee overheads.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold">Withdrawal tax fees</span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>Withheld automatically from outbound balances to cover gas limits on BNB chain/Polygon networks during transfers.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold">Support Dispatch</span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>System-generated alerts (such as failed OTP alerts) are directed to this mailbox for administrator moderation.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {isToastOpen && (
        <Toast
          message="Platform settings updated and deployed."
          variant="success"
          onClose={() => setIsToastOpen(false)}
        />
      )}
    </div>
  );
};
export default SettingsView;
