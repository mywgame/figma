/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Users, History, HelpCircle, Menu, ArrowDownToLine, ArrowUpFromLine, Gift, UserPlus } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { DashboardTab } from './Sidebar.tsx';

export type QuickActionType = 'deposit' | 'withdraw' | 'claim' | 'invite';

interface BottomNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onMoreClick: () => void;
  onQuickAction: (actionType: QuickActionType) => void;
}

/**
 * Mobile-only fixed bottom shell: a slim Quick Actions strip (Deposit /
 * Withdraw / Claim / Invite — reuses the same handler as the desktop
 * DashboardHome buttons, so there's a single source of truth for the
 * behavior) stacked above a minimal one-handed tab bar. Desktop continues
 * to use the persistent Sidebar (hidden here via md:hidden).
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onMoreClick, onQuickAction }) => {
  const { t } = useTheme();

  const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const quickActions: { id: QuickActionType; label: string; icon: React.ElementType; grad: string }[] = [
    { id: 'deposit', label: 'Deposit', icon: ArrowDownToLine, grad: 'from-emerald-500 to-teal-500' },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine, grad: 'from-rose-500 to-red-500' },
    { id: 'claim', label: 'Claim', icon: Gift, grad: 'from-cyan-500 to-blue-500' },
    { id: 'invite', label: 'Invite', icon: UserPlus, grad: 'from-purple-500 to-pink-500' },
  ];

  // "More" is treated as its own pseudo-tab: active when the user is on a view
  // not represented by one of the four primary tabs (profile/security/settings).
  const isMoreActive = !tabs.some((i) => i.id === activeTab);

  return (
    <nav
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-colors duration-300 ${t.navBg} ${t.navBorder}`}
    >
      {/* Quick Actions strip — one-handed reach, top row of the fixed shell */}
      <div className={`flex items-center justify-around px-3 pt-2.5 pb-2 border-b ${t.sep}`}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onQuickAction(action.id)}
              className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none group"
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${action.grad} text-white shadow-md transition-transform group-active:scale-90`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span className={`text-[8.5px] font-bold tracking-wide ${t.textMuted}`}>{action.label}</span>
            </button>
          );
        })}
      </div>

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
