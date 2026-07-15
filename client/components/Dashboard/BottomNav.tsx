/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Users, History, HelpCircle, Menu } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { DashboardTab } from './Sidebar.tsx';

interface BottomNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onMoreClick: () => void;
}

/**
 * Mobile-only fixed bottom tab bar — same navigation, same icons, same
 * routing as before. Only the visual treatment changed: the active tab now
 * sits on the MetaFirm brand gradient (cyan → purple) with a smooth
 * lift/scale transition instead of a flat highlight color.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onMoreClick }) => {
  const { t } = useTheme();

  const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  // "More" is treated as its own pseudo-tab: active when the user is on a view
  // not represented by one of the four primary tabs (profile/security/settings).
  const isMoreActive = !tabs.some((i) => i.id === activeTab);

  const renderItem = (
    key: string,
    label: string,
    Icon: React.ElementType,
    isActive: boolean,
    onClick: () => void,
  ) => (
    <button
      key={key}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none group"
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator pill */}
      <span
        className={`absolute -top-[1px] h-[3px] rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 ease-out ${
          isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
        }`}
      />

      <span
        className={`flex items-center justify-center w-9 h-9 rounded-2xl transition-all duration-300 ease-out transform ${
          isActive
            ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white scale-110 shadow-lg shadow-cyan-500/25 -translate-y-0.5'
            : `${t.navInactive} group-hover:text-cyan-500 group-active:scale-90`
        }`}
      >
        <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 2} />
      </span>
      <span
        className={`text-[9px] font-bold tracking-wide transition-colors duration-300 ${
          isActive ? 'bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent' : t.navInactive
        }`}
      >
        {label}
      </span>
    </button>
  );

  return (
    <nav
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-colors duration-300 ${t.navBg} ${t.navBorder}`}
    >
      <div className="grid grid-cols-5 h-[62px] max-w-lg mx-auto">
        {tabs.map((item) => renderItem(item.id, item.label, item.icon, activeTab === item.id, () => setActiveTab(item.id)))}
        {renderItem('more', 'More', Menu, isMoreActive, onMoreClick)}
      </div>
    </nav>
  );
};

export default BottomNav;
