/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Award, 
  TrendingUp, 
  Gift, 
  Coins, 
  LifeBuoy, 
  Megaphone, 
  FileText, 
  ShieldAlert, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard'
  | 'users'
  | 'deposits'
  | 'withdrawals'
  | 'vip'
  | 'income'
  | 'rewards'
  | 'salary'
  | 'support'
  | 'announcements'
  | 'audit'
  | 'security'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  userRole?: string;
}

// Role-Based Access Control mapping for Admin Sidebar items
const ROLE_PERMISSIONS: Record<string, AdminTab[]> = {
  admin: [
    'dashboard', 'users', 'deposits', 'withdrawals', 'vip', 
    'income', 'rewards', 'salary', 'support', 'announcements', 
    'audit', 'security', 'settings'
  ],
  superadmin: [
    'dashboard', 'users', 'deposits', 'withdrawals', 'vip', 
    'income', 'rewards', 'salary', 'support', 'announcements', 
    'audit', 'security', 'settings'
  ],
  operator: [
    'dashboard', 'users', 'deposits', 'withdrawals', 'announcements', 'audit', 'security'
  ],
  support: [
    'dashboard', 'users', 'support', 'announcements'
  ],
  finance: [
    'dashboard', 'deposits', 'withdrawals', 'income', 'rewards', 'salary'
  ],
  auditor: [
    'dashboard', 'audit', 'security'
  ],
  user: [] // Ordinary users have zero permitted tabs (blocked)
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
  userRole = 'user'
}) => {
  interface MenuItem {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<any>;
    color?: string;
  }

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: ArrowDownLeft, color: 'text-emerald-500' },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight, color: 'text-amber-500' },
    { id: 'vip', label: 'VIP Management', icon: Award, color: 'text-purple-500' },
    { id: 'income', label: 'Income Engine', icon: TrendingUp, color: 'text-blue-500' },
    { id: 'rewards', label: 'Rewards Pool', icon: Gift, color: 'text-rose-500' },
    { id: 'salary', label: 'Corporate Salary', icon: Coins, color: 'text-indigo-500' },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'security', label: 'System Security', icon: ShieldAlert },
    { id: 'settings', label: 'Console Settings', icon: Settings },
  ];

  // Resolve permitted tabs dynamically from the permissions registry
  const normalizedRole = userRole.toLowerCase();
  const allowedTabs = ROLE_PERMISSIONS[normalizedRole] || [];
  const filteredMenuItems = menuItems.filter(item => allowedTabs.includes(item.id));

  const handleTabClick = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Brand Logo Header */}
      <div className={`p-5 flex items-center justify-between border-b border-gray-50/80 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center space-x-2.5 text-left">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm tracking-tight text-gray-950 block">
                MetaFirm Admin
              </span>
              <span className="text-[9px] font-mono text-blue-600 uppercase tracking-widest block font-bold leading-none">
                OPS TERMINAL
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-4.5 h-4.5 text-amber-300" />
          </div>
        )}

        {/* Collapsible Trigger button for Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100 transition-all cursor-pointer"
          title={isCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Scrollable Navigation List */}
      <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-100/50'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : item.color || 'text-gray-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer block */}
      <div className="p-3 border-t border-gray-50 bg-gray-50/30">
        <button
          onClick={onLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? "Logout Session" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Sign Out Console</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar container */}
      <aside 
        className={`hidden md:block h-screen flex-shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Slide-out overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Drawer container body */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-white transform transition-transform duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
