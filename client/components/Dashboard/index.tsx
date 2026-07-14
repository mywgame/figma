/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { Button } from '../ui/Buttons/index.tsx';
import { Input } from '../ui/Inputs/index.tsx';
import { DashboardTab, Sidebar } from './Sidebar.tsx';
import { TopNav } from './TopNav.tsx';
import { BottomNav } from './BottomNav.tsx';
import { GradientOrbs } from './GradientOrbs.tsx';
import { api } from '../../services/api.ts';
import { DashboardData } from '../../types/index.ts';
import { mockIdentity } from '../../mocks/dashboardMockData.ts';

// Tab Views
import { DashboardHome } from './DashboardHome.tsx';
import { MyTeamView } from './MyTeamView.tsx';
import { ProfileView } from './ProfileView.tsx';
import { SecurityView } from './SecurityView.tsx';
import { SettingsView } from './SettingsView.tsx';
import { SupportView } from './SupportView.tsx';
import { TransactionsView } from './TransactionsView.tsx';

// Overlay
import { ArrowLeft, Check, Copy, Wallet, X } from 'lucide-react';
import { Toast } from '../ui/Feedback/index.tsx';

interface UserDashboardProps {
  onBackToLanding: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onBackToLanding }) => {
  const { user, logout } = useAuth();
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Actions Overlays
  const [activeModal, setActiveModal] = useState<'none' | 'deposit' | 'withdraw'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Form Fields
  const [depositAmount, setDepositAmount] = useState('1000');
  const [depositNetwork, setDepositNetwork] = useState('USDT_BEP20');
  const [withdrawAmount, setWithdrawAmount] = useState('500');
  const [withdrawAddress, setWithdrawAddress] = useState('0x72a9df28c9e120...f82e');

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<DashboardData>('/users/dashboard');
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        showToast(response.error?.message || 'Failed to sync with the financial ledger.');
      }
    } catch (error: any) {
      showToast(error.message || 'Network error occurred while updating the dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleLogout = () => {
    logout();
    onBackToLanding();
  };

  const handleQuickAction = (actionType: 'deposit' | 'withdraw' | 'claim' | 'team' | 'invite') => {
    if (actionType === 'deposit') {
      setActiveModal('deposit');
    } else if (actionType === 'withdraw') {
      setActiveModal('withdraw');
    } else if (actionType === 'claim') {
      setActiveTab('dashboard');
      showToast('Centered on Daily Yield Claim widget');
    } else if (actionType === 'team') {
      setActiveTab('team');
    } else if (actionType === 'invite') {
      const code = user?.referralCode;
      if (code) {
        navigator.clipboard.writeText(`https://metafirm.app/ref/${code}`);
        showToast('Referral link copied to clipboard!');
      } else {
        showToast('Referral code unavailable — sync your profile and try again.');
      }
    }
  };

  const triggerMockDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal('none');
    showToast(`Inbound request of $${depositAmount} USD transmitted. Waiting for ledger verification...`);
  };

  const triggerMockWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal('none');
    showToast(`Debit transfer of $${withdrawAmount} USD initiated. Check Security Logs...`);
  };

  const getDepositAddress = () => {
    if (!dashboardData || !dashboardData.depositAddresses) return '0x9821c9e2b45a90d1f43a8b32d541';
    const found = dashboardData.depositAddresses.find(da => da.network === depositNetwork);
    return found ? found.address : '0x9821c9e2b45a90d1f43a8b32d541';
  };

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(getDepositAddress());
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Note: Team/Profile/Security/Settings/Support/Transactions still use their
  // original light-only design and (pre-existing) mock data — that is
  // unchanged, out of this redesign's scope. Wrapping them in a neutral
  // light card frame keeps them looking intentional against the dark
  // gradient-orb shell instead of visually clashing when dark mode is on.
  const wrapLegacyView = (node: React.ReactNode) => (
    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-1">{node}</div>
  );

  // Render main sub-view depending on active tab state
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome onQuickAction={handleQuickAction} />;
      case 'profile':
        return wrapLegacyView(<ProfileView />);
      case 'team':
        return wrapLegacyView(<MyTeamView />);
      case 'transactions':
        return wrapLegacyView(<TransactionsView />);
      case 'security':
        return wrapLegacyView(<SecurityView />);
      case 'settings':
        return wrapLegacyView(<SettingsView />);
      case 'support':
        return wrapLegacyView(<SupportView />);
      default:
        return <DashboardHome onQuickAction={handleQuickAction} />;
    }
  };

  return (
    <div className={`relative flex min-h-screen font-sans transition-colors duration-300 ${t.pageBg} ${t.text}`} id="premium-user-dashboard">

      {/* 0. Decorative background (single shared instance) */}
      <GradientOrbs />

      {/* 1. Left Sidebar Navigation (desktop only — preserved with collapse/hamburger behavior) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* 2. Main content chassis block */}
      <div className="relative z-10 flex-grow flex flex-col min-w-0">

        {/* 2.1 Top Bar Navigation */}
        <TopNav identity={mockIdentity} />

        {/* 2.2 Scrollable Content Canvas Container */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 max-w-7xl w-full mx-auto pb-[calc(122px+env(safe-area-inset-bottom)+1.5rem)] md:pb-8">

          {/* Back shortcut — desktop only; mobile relies on BottomNav for navigation */}
          <div className={`hidden md:flex items-center justify-between pb-4 border-b ${t.sep}`}>
            <button
              onClick={onBackToLanding}
              className={`inline-flex items-center space-x-1.5 text-xs font-semibold transition-colors cursor-pointer ${t.textSub} hover:text-cyan-500`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Active Child View */}
          {renderActiveView()}

        </main>
      </div>

      {/* 2.3 Mobile App-Style Bottom Shell (hidden on md+, Sidebar takes over there) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMoreClick={() => setIsMobileSidebarOpen(true)}
        onQuickAction={handleQuickAction}
      />

      {/* 3. Popups/Modals Overlays for Quick Actions */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setActiveModal('none')} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-md w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${t.isDark ? 'bg-[#0e1230]' : 'bg-white'} ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <div className="flex items-center space-x-2 text-cyan-500">
                <Wallet className="w-5 h-5" />
                <h3 className={`font-display font-extrabold text-sm sm:text-base ${t.text}`}>Inbound Deposit Gateway</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className={`p-1 rounded-lg cursor-pointer ${t.textMuted} hover:text-cyan-500`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs leading-relaxed font-sans ${t.textSub}`}>
              To credit your balance sheets instantly, transmit USDT (ERC20) to your dedicated multi-sig account address below.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className={`text-[9px] font-mono font-bold uppercase block ${t.textMuted}`}>Select Blockchain Network</span>
                <div className="grid grid-cols-3 gap-2">
                  {['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setDepositNetwork(net)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-mono border transition-all cursor-pointer text-center ${
                        depositNetwork === net
                          ? 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30 font-bold'
                          : `${t.cardInner} ${t.textSub} border-transparent`
                      }`}
                    >
                      {net.replace('USDT_', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className={`text-[9px] font-mono font-bold uppercase block ${t.textMuted}`}>Your Destination Address ({depositNetwork.replace('USDT_', '')})</span>
                <div className={`p-3 rounded-2xl flex items-center justify-between font-mono text-xs select-all ${t.inset} ${t.text}`}>
                  <span className="truncate">{getDepositAddress()}</span>
                  <button onClick={handleCopyWalletAddress} className={`p-1.5 rounded-lg cursor-pointer ${t.pill} ${t.textSub} hover:text-cyan-500`}>
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <form onSubmit={triggerMockDeposit} className="space-y-4">
                <Input
                  label="Expected Value Amount (USD equivalent)"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Transmit Inbound Notice
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setActiveModal('none')} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-md w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${t.isDark ? 'bg-[#0e1230]' : 'bg-white'} ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <div className="flex items-center space-x-2 text-amber-500">
                <Wallet className="w-5 h-5" />
                <h3 className={`font-display font-extrabold text-sm sm:text-base ${t.text}`}>Outbound Withdrawal Gateway</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className={`p-1 rounded-lg cursor-pointer ${t.textMuted} hover:text-cyan-500`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs leading-relaxed font-sans ${t.textSub}`}>
              Initiate a debit from your ledger balances. Transmissions are finalized after passing zero-trust dual-factor validation.
            </p>

            <form onSubmit={triggerMockWithdraw} className="space-y-4">
              <Input
                label="Destination Wallet Address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                required
                className="font-mono text-xs"
              />
              <Input
                label="Withdrawal Amount (USD)"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" className="w-full bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/10 border-none">
                Submit Outbound Request
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedbacks */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}

    </div>
  );
};

export default UserDashboard;
