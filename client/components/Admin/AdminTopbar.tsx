/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { 
  Menu, 
  Search, 
  Bell, 
  Clock, 
  ShieldCheck, 
  Globe, 
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';
import { Dropdown } from '../ui/Inputs/index.tsx';

interface AdminTopbarProps {
  onMobileMenuToggle: () => void;
  activeTab: string;
  onSearchChange?: (val: string) => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onMobileMenuToggle,
  activeTab,
  onSearchChange
}) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
        ' ' + 
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Console Dashboard';
      case 'users': return 'User Ledger Management';
      case 'deposits': return 'Deposit Clearing Desk';
      case 'withdrawals': return 'Withdrawal Settlement Workflow';
      case 'vip': return 'VIP Tiers & Capital Limits';
      case 'income': return 'Yield & Income Engines';
      case 'rewards': return 'Rewards & Incentive Distribution';
      case 'salary': return 'Corporate Salary Payroll';
      case 'support': return 'Support Tickets & Helpdesk';
      case 'announcements': return 'Corporate Bulletins & Releases';
      case 'audit': return 'Cryptographic Audit Trails';
      case 'security': return 'Security Enforcement Logs';
      case 'settings': return 'System Constants & Policies';
      default: return 'Administrative Console';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
      {/* Tab Title / Mobile menu toggle */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-display font-black text-gray-950 tracking-tight flex items-center gap-1.5 uppercase leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            {getTabTitle()}
          </h1>
          <span className="text-[9px] font-mono font-bold text-gray-400 block mt-1 uppercase">
            MetaFirm Network Operator Panel
          </span>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden lg:block w-72 max-w-sm relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${isSearchFocused ? 'text-blue-500' : ''}`}>
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search hashes, addresses, email accounts..."
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 focus:border-blue-500/80 rounded-xl bg-gray-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 font-sans"
        />
      </div>

      {/* Right Topbar actions display */}
      <div className="flex items-center space-x-4">
        
        {/* Live synchronized Business Time */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl font-mono text-[10px] font-semibold text-gray-500">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{currentTime}</span>
        </div>

        {/* System Health State indicator */}
        <div className="hidden md:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100/55 px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold text-emerald-700">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>OPS: STABLE</span>
        </div>

        {/* Notifications Button */}
        <button 
          className="relative p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all cursor-pointer"
          title="Notification bulletins"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {/* Operator profile card */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center font-display uppercase shadow-sm">
            {user?.email ? user.email.charAt(0) : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-[10px] font-mono text-gray-400 font-extrabold block leading-none">ROOT OPERATOR</span>
            <span className="text-xs font-bold text-gray-900 block truncate max-w-[120px]">{user?.email || 'admin@cefi.platform'}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
