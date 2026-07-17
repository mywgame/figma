/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gift } from 'lucide-react';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { useTheme } from '../../../hooks/useTheme.ts';

interface RewardsViewProps {
  onBack: () => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ onBack }) => {
  const { t } = useTheme();

  return (
    <DashboardLayout
      title="Rewards & Performance Bonuses"
      description="Access your system-calculated yields, referral match payouts, VIP commissions, and active campaign bonuses."
      onBack={onBack}
    >
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4" id="rewards-view-container">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
          <Gift className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className={`text-lg font-bold ${t.text}`}>Under Construction</h3>
          <p className={`text-xs ${t.textSub} max-w-sm`}>
            The Rewards module is currently being finalized and will be fully implemented in the next sprint.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RewardsView;
