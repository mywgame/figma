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
 * Mobile-only fixed bottom tab bar — minimal, one-handed navigation.
 * (Quick Actions — Deposit/Withdraw/Claim/Invite — live only in the
 * Dashboard Home content row now, not duplicated here.)
 * Desktop continues to use the persistent Sidebar (hidden here via md:hidden).
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

  return (
    <nav
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-colors duration-300 ${t.navBg} ${t.navBorder}`}
    >
      {/* Primary Tab Bar */}
      <div className="grid grid-cols-5 h-[62px] max-w-lg mx-auto">
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none group"
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-2xl transition-all duration-200 ${
                  isActive ? `text-cyan-500 ${t.navActiveBg}` : `${t.navInactive} group-active:scale-90`
                }`}
              >
                <Icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-cyan-500' : t.navInactive}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More: opens the drawer with Profile / Security / Settings / Logout */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none group"
        >
          <span
            className={`flex items-center justify-center w-9 h-9 rounded-2xl transition-all duration-200 ${
              isMoreActive ? `text-cyan-500 ${t.navActiveBg}` : `${t.navInactive} group-active:scale-90`
            }`}
          >
            <Menu className="w-[19px] h-[19px]" strokeWidth={isMoreActive ? 2.4 : 2} />
          </span>
          <span className={`text-[9px] font-bold tracking-wide ${isMoreActive ? 'text-cyan-500' : t.navInactive}`}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
