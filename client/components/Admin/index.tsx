/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';

// Layout and Navigation
import { AdminSidebar, AdminTab } from './AdminSidebar.tsx';
import { AdminTopbar } from './AdminTopbar.tsx';

// Sub-Views
import { DashboardHome } from './DashboardHome.tsx';
import { UsersView, AdminUser } from './UsersView.tsx';
import { DepositsView, AdminDeposit } from './DepositsView.tsx';
import { WithdrawalsView, AdminWithdrawal } from './WithdrawalsView.tsx';
import { VipView, VipAccount } from './VipView.tsx';
import { IncomeView } from './IncomeView.tsx';
import { RewardsView } from './RewardsView.tsx';
import { SalaryView } from './SalaryView.tsx';
import { SupportView, SupportTicket } from './SupportView.tsx';
import { AnnouncementsView, Announcement } from './AnnouncementsView.tsx';
import { AuditLogsView, AuditLog } from './AuditLogsView.tsx';
import { SecurityView } from './SecurityView.tsx';
import { SettingsView, SystemSettings } from './SettingsView.tsx';

// Interactive feedbacks
import { Toast } from '../ui/Feedback/index.tsx';
import { ArrowLeft, RefreshCw, LayoutDashboard, X, KeyRound, Check } from 'lucide-react';

interface EnterpriseAdminDashboardProps {
  onBackToLanding: () => void;
}

export const EnterpriseAdminDashboard: React.FC<EnterpriseAdminDashboardProps> = ({ onBackToLanding }) => {
  const { logout, user, token } = useAuth();

  // Navigation states
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Notifications feedback states
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [resetTempPassword, setResetTempPassword] = useState<{ email: string; temp: string } | null>(null);

  const showToastMessage = (message: string, variant: 'success' | 'danger' = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  };

  // Central Financial and System metrics states
  const [platformBalanceValue, setPlatformBalanceValue] = useState(12482091.55);
  const [pendingWithdrawalCount, setPendingWithdrawalCount] = useState(3);
  const [pendingSupportCount, setPendingSupportCount] = useState(2);

  // Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    platformName: 'MetaFirm Platform',
    businessTimezone: 'UTC',
    minDeposit: 100,
    minWithdrawal: 50,
    maintenanceMode: false
  });

  // 1. Users State
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 'USR-8921', name: 'Dr. Michael Chen', email: 'michael.chen@quant.com', vipTier: 'Level 3', status: 'Active', registrationDate: '2026-05-15' },
    { id: 'USR-4819', name: 'Sarah Jenkins', email: 'sarah.jenkins@gmail.com', vipTier: 'Level 2', status: 'Active', registrationDate: '2026-06-02' },
    { id: 'USR-1204', name: 'Alex Khasanov', email: 'alex.kh@infra.net', vipTier: 'Level 1', status: 'Active', registrationDate: '2026-06-10' },
    { id: 'USR-3041', name: 'Elena Rostova', email: 'elena.rostova@legal.org', vipTier: 'None', status: 'Active', registrationDate: '2026-06-14' },
    { id: 'USR-7731', name: 'John Doe', email: 'john.doe@gmail.com', vipTier: 'None', status: 'Flagged', registrationDate: '2026-06-20' },
    { id: 'USR-9041', name: 'Marcus Aurelius', email: 'marcus@stoic.it', vipTier: 'Level 1', status: 'Suspended', registrationDate: '2026-06-22' },
    { id: 'USR-6625', name: 'Jane Smith', email: 'jane.smith@yahoo.com', vipTier: 'None', status: 'Active', registrationDate: '2026-06-25' },
    { id: 'USR-5110', name: 'William Shakespeare', email: 'william@bard.co.uk', vipTier: 'Level 2', status: 'Active', registrationDate: '2026-06-26' },
  ]);

  // 2. Deposits State
  const [deposits, setDeposits] = useState<AdminDeposit[]>([
    { id: 'DEP-90418', userEmail: 'michael.chen@quant.com', amount: 25000.00, gateway: 'USDT-ERC20', status: 'Pending', timestamp: '2026-06-29 06:12:44 UTC' },
    { id: 'DEP-89211', userEmail: 'sarah.jenkins@gmail.com', amount: 15000.00, gateway: 'USDC-ERC20', status: 'Pending', timestamp: '2026-06-29 05:40:12 UTC' },
    { id: 'DEP-81203', userEmail: 'elena.rostova@legal.org', amount: 50000.00, gateway: 'USD-WIRE', status: 'Approved', timestamp: '2026-06-28 14:20:15 UTC' },
    { id: 'DEP-81192', userEmail: 'alex.kh@infra.net', amount: 8500.00, gateway: 'BTC-NATIVE', status: 'Approved', timestamp: '2026-06-27 11:32:04 UTC' },
    { id: 'DEP-81181', userEmail: 'john.doe@gmail.com', amount: 1200.00, gateway: 'USDT-ERC20', status: 'Rejected', timestamp: '2026-06-26 09:15:22 UTC' },
  ]);

  // 3. Withdrawals State
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([
    { id: 'WTH-41120', userEmail: 'michael.chen@quant.com', amount: 4500.00, destinationAddress: '0x92a3f...d15c', status: 'Pending', timestamp: '2026-06-29 07:01:22 UTC' },
    { id: 'WTH-41119', userEmail: 'sarah.jenkins@gmail.com', amount: 2200.00, destinationAddress: '0x18db2...c8a4', status: 'Pending', timestamp: '2026-06-29 06:44:11 UTC' },
    { id: 'WTH-41118', userEmail: 'john.doe@gmail.com', amount: 800.00, destinationAddress: '0x74ca1...20fe', status: 'Pending', timestamp: '2026-06-29 04:12:05 UTC' },
    { id: 'WTH-31102', userEmail: 'alex.kh@infra.net', amount: 15000.00, destinationAddress: '0x88ea2...33da', status: 'Approved', timestamp: '2026-06-28 18:02:15 UTC' },
    { id: 'WTH-31091', userEmail: 'elena.rostova@legal.org', amount: 500.00, destinationAddress: '0x32ba1...fa12', status: 'Rejected', timestamp: '2026-06-27 10:45:33 UTC' },
  ]);

  // 4. VIP State
  const [vipAccounts, setVipAccounts] = useState<VipAccount[]>([
    { id: 'VIP-001', name: 'Dr. Michael Chen', email: 'michael.chen@quant.com', currentTier: 'Level 3', totalInvestment: 245000.00, multiplier: 2.10, status: 'Active' },
    { id: 'VIP-002', name: 'Sarah Jenkins', email: 'sarah.jenkins@gmail.com', currentTier: 'Level 2', totalInvestment: 45000.00, multiplier: 1.50, status: 'Active' },
    { id: 'VIP-003', name: 'Alex Khasanov', email: 'alex.kh@infra.net', currentTier: 'Level 1', totalInvestment: 12500.00, multiplier: 1.25, status: 'Active' },
    { id: 'VIP-004', name: 'John Doe', email: 'john.doe@gmail.com', currentTier: 'None', totalInvestment: 1200.00, multiplier: 1.00, status: 'Under Review' },
  ]);

  // 5. Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-201',
      userEmail: 'michael.chen@quant.com',
      subject: 'Inquiry regarding private institutional OTC desk liquidity limits',
      priority: 'High',
      status: 'Open',
      timestamp: '2026-06-29 05:12:00 UTC',
      messages: [
        { sender: 'Client', text: 'Good morning. I am expecting to route a USD Wire of approximately $2M tomorrow. What are our immediate limit extensions on quantitative vaults?', time: '05:12' }
      ]
    },
    {
      id: 'TCK-198',
      userEmail: 'john.doe@gmail.com',
      subject: 'Security alert: 2FA prompt mismatch notice on login',
      priority: 'Critical',
      status: 'Open',
      timestamp: '2026-06-28 22:45:00 UTC',
      messages: [
        { sender: 'Client', text: 'I received an unauthorized login attempt from an unknown IP address block. Please freeze withdrawals temporarily.', time: '22:45' }
      ]
    },
    {
      id: 'TCK-182',
      userEmail: 'alex.kh@infra.net',
      subject: 'Clarification on custom referral compounding multiplier tiers',
      priority: 'Medium',
      status: 'Resolved',
      timestamp: '2026-06-27 14:10:00 UTC',
      messages: [
        { sender: 'Client', text: 'Does my referral multiplier stack with my VIP level bonus?', time: '14:10' },
        { sender: 'Support', text: 'Hello Alex, yes indeed! Referral incentives apply as a direct booster on top of base VIP compounding multiplier calculations.', time: '14:22' }
      ]
    }
  ]);

  // 6. Bulletins Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 'ANN-001', title: 'Security Hardening: Overnight Hardware security module (HSM) patches successfully compiled', content: 'Our engineering systems completed compilation and automated push of secondary security policies onto HSM keystores to mitigate ledger sync latencies.', status: 'Published', date: 'Jun 28, 2026' },
    { id: 'ANN-002', title: 'Strategic Upgrade: Support Desk integration complete', content: 'Client helpdesk communications are fully migrated to a centralized multi-sig encrypted routing queue to guarantee response times below 15 minutes.', status: 'Published', date: 'Jun 27, 2026' },
    { id: 'ANN-003', title: 'System Notice: Institutional API Documentation Release', content: 'We are completing documentation for programmatic vault interfaces designed to connect quant systems directly.', status: 'Draft', date: 'Jun 29, 2026' },
  ]);

  // 7. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'AUD-9121c', adminEmail: 'root@cefi.platform', action: 'Operator synchronized firewall definitions', module: 'SECURITY', timestamp: '2026-06-29 07:01:10 UTC', ipAddress: '192.168.1.1' },
    { id: 'AUD-89211', adminEmail: 'root@cefi.platform', action: 'Completed system health parameters audit', module: 'SYSTEM_CONFIG', timestamp: '2026-06-29 05:32:00 UTC', ipAddress: '192.168.1.1' },
    { id: 'AUD-7810e', adminEmail: 'root@cefi.platform', action: 'Authorized quantitative withdrawal clearance for USR-1204', module: 'SETTLEMENT', timestamp: '2026-06-28 18:02:15 UTC', ipAddress: '192.168.1.5' },
    { id: 'AUD-6619a', adminEmail: 'root@cefi.platform', action: 'Upgraded client portfolio portfolio tier to Level 3', module: 'VIP_PROMO', timestamp: '2026-06-28 11:20:00 UTC', ipAddress: '127.0.0.1' },
    { id: 'AUD-5520c', adminEmail: 'root@cefi.platform', action: 'Root operator authentication handshake completed', module: 'AUTH', timestamp: '2026-06-28 09:00:15 UTC', ipAddress: '192.168.1.1' },
  ]);

  // State-modifier helper: Log audit event locally
  const addAuditLog = (action: string, module: AuditLog['module']) => {
    const nextLog: AuditLog = {
      id: 'AUD-' + Math.random().toString(16).slice(2, 7),
      adminEmail: user?.email || 'root@cefi.platform',
      action,
      module,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      ipAddress: '192.168.1.1'
    };
    setAuditLogs(prev => [nextLog, ...prev]);
  };

  // Fetch real users from database
  const fetchRealUsers = async () => {
    try {
      const res = await fetch('/api/v1/users/admin/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('metafirm_token')}`
        }
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          const mapped: AdminUser[] = body.data.map((u: any) => ({
            id: u.uid,
            name: u.name || u.email.split('@')[0] || 'Institutional Client',
            email: u.email,
            vipTier: u.vipTier === 'VIP_3' ? 'Level 3' : u.vipTier === 'VIP_2' ? 'Level 2' : u.vipTier === 'VIP_1' ? 'Level 1' : 'None',
            status: u.status === 'ACTIVE' ? 'Active' : u.status === 'SUSPENDED' ? 'Suspended' : 'Flagged',
            role: u.role || 'USER',
            registrationDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-06-30'
          }));
          setUsers(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to load real users from backend:', err);
    }
  };

  // Fetch real users when admin tab changes
  React.useEffect(() => {
    if (activeTab === 'users' || activeTab === 'dashboard') {
      fetchRealUsers();
    }
  }, [activeTab]);

  // Execute actual admin security and promotion actions
  const handleAdminAction = async (
    userId: string, 
    action: 'RESET_PASSWORD' | 'FORCE_PASSWORD_CHANGE' | 'SUSPEND' | 'UNLOCK' | 'CHANGE_VIP' | 'CHANGE_ROLE', 
    extraData?: any
  ) => {
    try {
      const res = await fetch('/api/v1/users/admin/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('metafirm_token')}`
        },
        body: JSON.stringify({
          userId,
          action,
          role: extraData?.role,
          vipTier: extraData?.vipTier
        })
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || `Action ${action} failed.`);
      }

      showToastMessage(body.message || `Action ${action} executed successfully.`);
      
      // If reset password action, show the temporary password generated securely in our UI state!
      if (action === 'RESET_PASSWORD' && body.data?.tempPassword) {
        const targetUser = users.find(u => u.id === userId);
        setResetTempPassword({
          email: targetUser?.email || 'Unknown User',
          temp: body.data.tempPassword
        });
      }

      addAuditLog(`Executed admin action: ${action} on user ${userId}`, 'VIP_PROMO');
      await fetchRealUsers();
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to complete admin action.', 'danger');
    }
  };

  // State Updates: Deposit View
  const handleApproveDeposit = (depId: string) => {
    const depositItem = deposits.find(d => d.id === depId);
    if (!depositItem) return;

    setDeposits(prev => prev.map(d => d.id === depId ? { ...d, status: 'Approved' } : d));
    setPlatformBalanceValue(prev => prev + depositItem.amount);
    
    addAuditLog(`Approved clearing deposit transaction ${depId} for $${depositItem.amount.toLocaleString()} USD from ${depositItem.userEmail}`, 'SETTLEMENT');
    showToastMessage(`Cleared deposit ${depId} successfully.`);
  };

  const handleRejectDeposit = (depId: string) => {
    const depositItem = deposits.find(d => d.id === depId);
    if (!depositItem) return;

    setDeposits(prev => prev.map(d => d.id === depId ? { ...d, status: 'Rejected' } : d));
    
    addAuditLog(`Rejected inbound deposit transaction ${depId} for $${depositItem.amount.toLocaleString()} USD from ${depositItem.userEmail}`, 'SETTLEMENT');
    showToastMessage(`Inbound notice ${depId} rejected.`, 'danger');
  };

  // State Updates: Withdrawal View
  const handleApproveWithdrawal = (wId: string) => {
    const wItem = withdrawals.find(w => w.id === wId);
    if (!wItem) return;

    setWithdrawals(prev => prev.map(w => w.id === wId ? { ...w, status: 'Approved' } : w));
    setPlatformBalanceValue(prev => prev - wItem.amount);
    setPendingWithdrawalCount(prev => Math.max(prev - 1, 0));
    
    addAuditLog(`Authorized cryptographic settlement payout ${wId} of $${wItem.amount.toLocaleString()} USD to destination ${wItem.destinationAddress}`, 'SETTLEMENT');
    showToastMessage(`Settled outbound withdrawal ${wId}`);
  };

  const handleRejectWithdrawal = (wId: string) => {
    const wItem = withdrawals.find(w => w.id === wId);
    if (!wItem) return;

    setWithdrawals(prev => prev.map(w => w.id === wId ? { ...w, status: 'Rejected' } : w));
    setPendingWithdrawalCount(prev => Math.max(prev - 1, 0));
    
    addAuditLog(`Cancelled outbound settlement payout ${wId} of $${wItem.amount.toLocaleString()} USD`, 'SETTLEMENT');
    showToastMessage(`Outbound request ${wId} rejected.`, 'danger');
  };

  // State Updates: VIP View
  const handleUpdateVip = (id: string, fields: Partial<VipAccount>) => {
    setVipAccounts(prev => prev.map(v => v.id === id ? { ...v, ...fields } : v));
    
    const account = vipAccounts.find(v => v.id === id);
    if (!account) return;

    // Synchronize to users list too
    setUsers(prev => prev.map(u => u.email === account.email ? { ...u, vipTier: fields.currentTier || u.vipTier } : u));

    addAuditLog(`Modified VIP credentials for portfolio ${id}. New tier: ${fields.currentTier || 'None'}`, 'VIP_PROMO');
    showToastMessage(`VIP tier updated for ${account.name}`);
  };

  // State Updates: Support View
  const handleReplyTicket = (tId: string, text: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === tId) {
        return {
          ...t,
          status: 'Pending Client',
          messages: [
            ...t.messages,
            { sender: 'Support', text, time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return t;
    }));
    addAuditLog(`Replied to client support ticket ${tId}`, 'SYSTEM_CONFIG');
    showToastMessage(`Reply transmitted to client.`);
  };

  const handleCloseTicket = (tId: string) => {
    setTickets(prev => prev.map(t => t.id === tId ? { ...t, status: 'Resolved' } : t));
    setPendingSupportCount(prev => Math.max(prev - 1, 0));
    addAuditLog(`Resolved client support ticket ${tId}`, 'SYSTEM_CONFIG');
    showToastMessage(`Ticket ${tId} marked resolved.`);
  };

  // State Updates: Announcements View
  const handleCreateAnnouncement = (title: string, content: string, status: 'Draft' | 'Published') => {
    const nextAnn: Announcement = {
      id: 'ANN-' + Math.random().toString().slice(2, 5),
      title,
      content,
      status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setAnnouncements(prev => [nextAnn, ...prev]);
    addAuditLog(`Created global dispatch ${nextAnn.id} (${status})`, 'SYSTEM_CONFIG');
    showToastMessage(`Announcement ${nextAnn.id} created.`);
  };

  const handleUpdateAnnouncementStatus = (id: string, status: 'Draft' | 'Published') => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    addAuditLog(`Modified dispatch status of bulletin ${id} to ${status}`, 'SYSTEM_CONFIG');
    showToastMessage(`Announcement ${id} status updated to ${status}`);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addAuditLog(`Deleted bulletin announcement ${id} permanently`, 'SYSTEM_CONFIG');
    showToastMessage(`Announcement ${id} removed permanently.`, 'danger');
  };

  // State Updates: Settings View
  const handleSaveSettings = (nextSettings: SystemSettings) => {
    setSystemSettings(nextSettings);
    addAuditLog(`Updated global settings parameters: timezone [${nextSettings.businessTimezone}], platform name [${nextSettings.platformName}]`, 'SYSTEM_CONFIG');
  };

  // Sub-views dispatcher routing
  const renderActiveSubView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome 
            stats={{
              totalUsers: users.length,
              activeUsers: users.filter(u => u.status === 'Active').length,
              todayRegistrations: 12,
              todayDeposits: deposits.filter(d => d.status === 'Approved' && d.timestamp.includes('2026-06-29')).reduce((acc, curr) => acc + curr.amount, 0),
              todayWithdrawals: withdrawals.filter(w => w.status === 'Approved' && w.timestamp.includes('2026-06-29')).reduce((acc, curr) => acc + curr.amount, 0),
              platformBalance: `$${platformBalanceValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              todayIncome: `$${(platformBalanceValue * 0.0002).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              pendingWithdrawals: pendingWithdrawalCount,
              pendingSupport: pendingSupportCount,
              totalVip: vipAccounts.filter(v => v.currentTier !== 'None').length
            }}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'users':
        return <UsersView users={users} onAdminAction={handleAdminAction} />;
      case 'deposits':
        return <DepositsView deposits={deposits} onApprove={handleApproveDeposit} onReject={handleRejectDeposit} />;
      case 'withdrawals':
        return <WithdrawalsView withdrawals={withdrawals} onApprove={handleApproveWithdrawal} onReject={handleRejectWithdrawal} />;
      case 'vip':
        return <VipView vipAccounts={vipAccounts} onUpdateVip={handleUpdateVip} />;
      case 'income':
        return <IncomeView platformBalance={`$${platformBalanceValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} onAuditLog={addAuditLog} />;
      case 'rewards':
        return <RewardsView onAuditLog={addAuditLog} />;
      case 'salary':
        return <SalaryView onAuditLog={addAuditLog} />;
      case 'support':
        return <SupportView tickets={tickets} onReplyTicket={handleReplyTicket} onCloseTicket={handleCloseTicket} />;
      case 'announcements':
        return (
          <AnnouncementsView 
            announcements={announcements} 
            onCreate={handleCreateAnnouncement} 
            onUpdateStatus={handleUpdateAnnouncementStatus} 
            onDelete={handleDeleteAnnouncement} 
          />
        );
      case 'audit':
        return <AuditLogsView logs={auditLogs} />;
      case 'security':
        return <SecurityView onAuditLog={addAuditLog} />;
      case 'settings':
        return (
          <SettingsView 
            settings={systemSettings} 
            onSave={handleSaveSettings} 
            userRole={user?.role}
            token={token}
          />
        );
      default:
        return <div className="text-left py-12 text-gray-500">View not compiled.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] text-gray-900 font-sans select-none overflow-hidden" id="enterprise-admin-dashboard-console">
      
      {/* 1. Sidebar Panel controller */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onLogout={logout}
        userRole={user?.role}
      />

      {/* 2. Main chassis wrapper */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden h-screen">
        
        {/* 2.1 Top bar and operational widgets */}
        <AdminTopbar
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          activeTab={activeTab}
        />

        {/* 2.2 Content Canvas */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto space-y-6 max-w-7xl w-full mx-auto pb-24">
          
          {/* Quick navigation header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Website</span>
            </button>
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
              AUTHORIZED CONSOLE SESSION ACTIVE
            </span>
          </div>

          {/* Active view layout */}
          <div className="animate-fade-in duration-250">
            {renderActiveSubView()}
          </div>

        </main>
      </div>

      {/* 3. Popups Feedbacks */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {/* Secure Password Reset Popup */}
      {resetTempPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-100 rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden text-left space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
            <button 
              onClick={() => setResetTempPassword(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs border border-blue-100">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-display font-black text-gray-950 uppercase tracking-tight">Temporary Key Generated</h3>
              <p className="text-[10px] font-mono text-blue-600 font-bold tracking-widest uppercase">
                SECURE CREDENTIAL ROTATION [SUCCESS]
              </p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              The account <strong>{resetTempPassword.email}</strong> has been assigned a dynamic temporary password. Copied below is the unique key:
            </p>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between font-mono text-xs select-all">
              <span className="font-bold text-gray-900 tracking-wider text-sm">{resetTempPassword.temp}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(resetTempPassword.temp);
                  showToastMessage('Temporary password copied to clipboard!');
                }}
                className="p-1.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-500 hover:text-blue-600 rounded-lg shadow-3xs cursor-pointer transition-all"
                title="Copy to clipboard"
              >
                <Check className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100/60 rounded-2xl text-[10px] text-amber-800 leading-relaxed font-sans">
              <strong>Crucial Notice:</strong> This key is generated as a secure, one-time hash. It is not saved in plain text on our servers. You must copy and distribute this password immediately. Once you close this prompt, it will be lost forever.
            </div>

            <button
              onClick={() => setResetTempPassword(null)}
              className="w-full py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all hover:shadow-lg cursor-pointer"
            >
              I Have Securely Copied Key
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnterpriseAdminDashboard;
