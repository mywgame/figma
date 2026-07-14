/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { ThemeSwitch } from '../ui/ThemeSwitch.tsx';
import { MetaFirmAssetIcon } from './MetaFirmAssetIcon.tsx';
import logoImg from '../../../assets/images/branding/logo.png';
import logoMarkImg from '../../../assets/images/branding/logo-mark.png';
import type { MockIdentity } from '../../mocks/dashboardMockData.ts';

interface TopNavProps {
  identity: MockIdentity;
}

/**
 * Dashboard header — pixel-matched to the figma reference: brand mark +
 * wordmark on the left, theme switch + single user-identity pill on the
 * right (rank-icon avatar with online dot, name, id, rank badge, streak).
 * Purely presentational — every value arrives via the `identity` prop so
 * this component never needs to change when it's fed real API data later.
 */
export const TopNav: React.FC<TopNavProps> = ({ identity }) => {
  const { t } = useTheme();

  return (
    <header className="flex justify-between items-center gap-4 py-1" id="dashboard-header">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logoMarkImg} alt="MetaFirm mark" className="w-9 h-9 object-contain" />
        <img
          src={logoImg}
          alt="MetaFirm"
          className={`h-7 object-contain hidden sm:block ${t.isDark ? 'brightness-0 invert' : ''}`}
        />
      </div>

      {/* Right: theme switch + user identity pill */}
      <div className="flex items-center gap-3">
        <ThemeSwitch />

        <div className={`flex items-center gap-3 backdrop-blur-xl border rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-300 ${t.pill} ${t.pillHover}`}>
          {/* Rank avatar */}
          <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${identity.rankBg} border border-white/20 flex items-center justify-center text-base sm:text-lg shrink-0`}>
            {identity.rankIcon}
            {identity.online && (
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 ${t.isDark ? 'border-[#07091a]' : 'border-white'}`} />
            )}
          </div>

          <div className="flex flex-col leading-tight min-w-0">
            <span className={`font-semibold text-xs sm:text-sm truncate max-w-[110px] sm:max-w-none ${t.text}`}>{identity.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-mono ${t.textSub}`}>{identity.id}</span>
              <span
                className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-semibold"
                style={{ color: identity.rankColor, background: `${identity.rankColor}22` }}
              >
                {identity.rankLabel}
              </span>
            </div>
          </div>

          <div className={`hidden sm:flex items-center gap-1 pl-3 border-l ${t.sep}`}>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-semibold text-orange-400">{identity.streakDays}d</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
