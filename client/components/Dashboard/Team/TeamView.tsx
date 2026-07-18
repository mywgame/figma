/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { SearchInput } from '../../ui/Inputs/index.tsx';
import { TeamStats } from './TeamStats.tsx';
import { TeamTable } from './TeamTable.tsx';
import { TeamMember, ReferralLevel } from './types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Users2, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { DashboardData } from '../../../types/index.ts';

interface TeamViewProps {
  dashboardData: DashboardData | null;
}

export const TeamView: React.FC<TeamViewProps> = ({ dashboardData }) => {
  const { t } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<ReferralLevel>('Level A');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract dynamic stats from live dashboardData if available, otherwise fallback to mock constants
  const totalMembers = useMemo(() => {
    if (dashboardData?.team) {
      return (
        dashboardData.team.levelACount +
        dashboardData.team.levelBCount +
        dashboardData.team.levelCCount +
        dashboardData.team.levelDCount
      );
    }
    return 17; // Mock fallback
  }, [dashboardData]);

  const totalValidCount = useMemo(() => {
    if (dashboardData?.team) {
      return dashboardData.team.teamTotalValidCount || dashboardData.team.levelAValidCount + dashboardData.team.levelBcdValidCount;
    }
    return 14; // Mock fallback
  }, [dashboardData]);

  const levelACount = dashboardData?.team?.levelACount ?? 5;
  const levelBCount = dashboardData?.team?.levelBCount ?? 5;
  const levelCCount = dashboardData?.team?.levelCCount ?? 4;
  const levelDCount = dashboardData?.team?.levelDCount ?? 3;

  // High-fidelity privacy-compliant Team Member database (Only Username, VIP Rank, and Today's Income)
  const allTeamMembers: Record<ReferralLevel, TeamMember[]> = {
    'Level A': [
      { username: 'cryptovisor', vipRank: 'VIP4', todaysIncome: '+$18.50' },
      { username: 'alpha_whale', vipRank: 'VIP6', todaysIncome: '+$85.20' },
      { username: 'solana_pro', vipRank: 'VIP3', todaysIncome: '+$6.45' },
      { username: 'nodemaster_x', vipRank: 'VIP5', todaysIncome: '+$42.10' },
      { username: 'yield_king', vipRank: 'VIP2', todaysIncome: '+$2.80' },
    ],
    'Level B': [
      { username: 'matrix_trader', vipRank: 'VIP3', todaysIncome: '+$8.15' },
      { username: 'hyperion_01', vipRank: 'VIP4', todaysIncome: '+$12.40' },
      { username: 'meta_quantum', vipRank: 'VIP2', todaysIncome: '+$3.10' },
      { username: 'nexus_node', vipRank: 'VIP1', todaysIncome: '+$0.00' },
      { username: 'vortex_operator', vipRank: 'VIP5', todaysIncome: '+$38.50' },
    ],
    'Level C': [
      { username: 'defi_pioneer', vipRank: 'VIP2', todaysIncome: '+$1.20' },
      { username: 'luna_eclipse', vipRank: 'VIP1', todaysIncome: '+$0.00' },
      { username: 'orbit_miner', vipRank: 'VIP3', todaysIncome: '+$7.30' },
      { username: 'genesis_block', vipRank: 'VIP4', todaysIncome: '+$14.80' },
    ],
    'Level D': [
      { username: 'stellar_tx', vipRank: 'VIP1', todaysIncome: '+$0.00' },
      { username: 'nebula_staker', vipRank: 'VIP2', todaysIncome: '+$2.45' },
      { username: 'apex_oracle', vipRank: 'VIP3', todaysIncome: '+$9.10' },
    ],
  };

  // Calculate today's total commission generated
  const todaysTotalGeneration = useMemo(() => {
    let total = 0;
    Object.values(allTeamMembers).forEach((levelMembers) => {
      levelMembers.forEach((member) => {
        const value = parseFloat(member.todaysIncome.replace(/[^0-9.-]/g, ''));
        if (!isNaN(value)) {
          total += value;
        }
      });
    });
    return `+$${total.toFixed(2)}`;
  }, []);

  // Filter members for active view
  const activeLevelMembers = useMemo(() => {
    const list = allTeamMembers[selectedLevel] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((member) => member.username.toLowerCase().includes(q));
  }, [selectedLevel, searchQuery]);

  return (
    <DashboardLayout
      title="My Team"
      description="Monitor multi-level referral contributions and verify active VIP tier partners in real-time."
    >
      <div className="space-y-6 text-left" id="team-view-feature-container">
        
        {/* Statistics Grid Component */}
        <TeamStats
          totalMembers={totalMembers}
          totalValidCount={totalValidCount}
          todaysTotalGeneration={todaysTotalGeneration}
          levelACount={levelACount}
          levelBCount={levelBCount}
          levelCCount={levelCCount}
          levelDCount={levelDCount}
          t={t}
        />

        {/* Level Switcher sliding tabs and Search row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Glassmorphic level tab selectors */}
          <div className={`flex flex-wrap gap-1 p-1 rounded-2xl border transition-all duration-300 ${
            t.isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'
          }`}>
            {(['Level A', 'Level B', 'Level C', 'Level D'] as ReferralLevel[]).map((level) => {
              const isActive = selectedLevel === level;
              const count = level === 'Level A' ? levelACount : level === 'Level B' ? levelBCount : level === 'Level C' ? levelCCount : levelDCount;

              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`relative text-[10px] xs:text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-colors duration-200 cursor-pointer focus:outline-none select-none z-10 ${
                    isActive
                      ? t.isDark ? 'text-cyan-400' : 'text-blue-600'
                      : `${t.textSub} hover:${t.text}`
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTeamTabGlow"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className={`absolute inset-0 rounded-xl -z-10 border ${
                        t.isDark
                          ? 'bg-white/8 border-white/12 shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                          : 'bg-white border-black/5 shadow-xs'
                      }`}
                    />
                  )}
                  <span>{level} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Member Search filter */}
          <div className="w-full lg:max-w-xs relative">
            <SearchInput
              placeholder="Search partner username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Team Table list container */}
        <TeamTable
          members={activeLevelMembers}
          levelLabel={selectedLevel}
          t={t}
        />
      </div>
    </DashboardLayout>
  );
};

export default TeamView;
