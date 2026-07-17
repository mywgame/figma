/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DollarSign } from 'lucide-react';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { useTheme } from '../../../hooks/useTheme.ts';

interface TaskViewProps {
  onBack: () => void;
}

export const TaskView: React.FC<TaskViewProps> = ({ onBack }) => {
  const { t } = useTheme();

  return (
    <DashboardLayout
      title="Incentive Tasks & Campaigns"
      description="Participate in active platform challenges, daily tasks, and referral incentives to unlock multiplier bonuses."
      onBack={onBack}
    >
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4" id="task-view-container">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className={`text-lg font-bold ${t.text}`}>Under Construction</h3>
          <p className={`text-xs ${t.textSub} max-w-sm`}>
            The Task module is currently being finalized and will be fully implemented in the next sprint.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaskView;
