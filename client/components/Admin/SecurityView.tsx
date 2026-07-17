/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  UserX,
  Lock,
  Unlock,
  Key,
  Laptop,
  Globe,
  Bell,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { SESSIONS_MOCK, ALERTS_MOCK } from './mockData.ts';

interface SecurityViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ t, isDark }) => {
  const [sessions, setSessions] = useState(SESSIONS_MOCK);
  const [alerts, setAlerts] = useState(ALERTS_MOCK);
  
  // Security Switches
  const [freezeWithdrawals, setFreezeWithdrawals] = useState(false);
  const [freezeRegistrations, setFreezeRegistrations] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle global lock
  const handleToggleFreezeWithdrawals = () => {
    const nextState = !freezeWithdrawals;
    setFreezeWithdrawals(nextState);
    showToast(`Withdrawals freeze set to ${nextState ? 'ACTIVE (All outgoing paused)' : 'INACTIVE (Standard withdrawals)'}`);
  };

  const handleToggleFreezeRegistrations = () => {
    const nextState = !freezeRegistrations;
    setFreezeRegistrations(nextState);
    showToast(`New registrations set to ${nextState ? 'BLOCKED' : 'ALLOWED'}`);
  };

  const handleToggle2FA = () => {
    const nextState = !enforce2FA;
    setEnforce2FA(nextState);
    showToast(`Mandatory admin 2FA set to ${nextState ? 'ENABLED' : 'DISABLED (Warning!)'}`);
  };

  // Revoke session
  const revokeSession = (adminName: string) => {
    // TODO: Replace with real API call
    setSessions(prev => prev.map(s => (s.admin === adminName ? { ...s, active: false } : s)));
    showToast(`Session for auditor account ${adminName} has been revoked.`);
  };

  // Clear alerts feed
  const clearAlerts = () => {
    setAlerts([]);
    showToast('Alerts threat logs feed cleared.');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Security Command</h2>
        <p className={`text-xs mt-1 ${t.textSub}`}>Monitor administrator sessions, deploy emergency circuit breakers, and review security threat logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Global Emergency Breaks & Switches */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 space-y-5">
            <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Platform Security Switches</span>
            </h3>

            <div className="space-y-4">
              {/* Switch 1: Withdrawals block */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">Freeze All Withdrawals</span>
                  <p className={`text-[10px] leading-relaxed ${t.textMuted}`}>Emergency break. Halts all outbound payouts immediately.</p>
                </div>
                <button onClick={handleToggleFreezeWithdrawals} className="cursor-pointer shrink-0 transition-all text-red-500">
                  {freezeWithdrawals ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                </button>
              </div>

              {/* Switch 2: Registrations freeze */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">Freeze Registrations</span>
                  <p className={`text-[10px] leading-relaxed ${t.textMuted}`}>Blocks new users from creating credentials temporarily.</p>
                </div>
                <button onClick={handleToggleFreezeRegistrations} className="cursor-pointer shrink-0 transition-all text-amber-500">
                  {freezeRegistrations ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                </button>
              </div>

              {/* Switch 3: 2FA Enforce */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">Mandatory Auditor 2FA</span>
                  <p className={`text-[10px] leading-relaxed ${t.textMuted}`}>Forces secure token authentication for all admin levels.</p>
                </div>
                <button onClick={handleToggle2FA} className="cursor-pointer shrink-0 transition-all text-emerald-500">
                  {enforce2FA ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                </button>
              </div>
            </div>
          </Card>

          {/* Security alerts Feed bento */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs flex items-center gap-2 text-red-400 uppercase tracking-wider">
                <Bell className="w-4 h-4" />
                <span>Threat Alerts Feed</span>
              </h4>
              {alerts.length > 0 && (
                <button
                  onClick={clearAlerts}
                  className={`text-[9px] font-mono font-bold uppercase transition-all hover:underline cursor-pointer ${t.textMuted}`}
                >
                  Dismiss Feed
                </button>
              )}
            </div>

            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((al, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 border text-left flex items-start gap-3 ${
                      al.level === 'High' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${al.level === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{al.msg}</p>
                      <p className={`text-[9px] font-mono font-medium ${t.textMuted}`}>{al.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-4 text-center font-medium text-xs ${t.textMuted}`}>
                  No active security threats registered.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Active auditor sessions */}
        <Card className="lg:col-span-7 p-0 overflow-hidden flex flex-col justify-between">
          <div>
            <div className={`p-4 border-b ${t.sep}`}>
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-500" />
                <span>Active Administrator Sessions</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100/10">
              {sessions.map((sess, idx) => (
                <div key={idx} className={`p-4 flex items-center justify-between gap-4 text-xs transition-colors ${t.cardInner}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      sess.active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-gray-500/15 text-gray-500'
                    }`}>
                      {sess.admin[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{sess.admin}</span>
                        <Badge variant={sess.active ? 'emerald' : 'neutral'}>
                          {sess.active ? 'Active Now' : 'Closed'}
                        </Badge>
                      </div>
                      <div className={`flex items-center gap-3 text-[10px] font-medium mt-1 ${t.textMuted}`}>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {sess.location} ({sess.ip})
                        </span>
                        <span className="flex items-center gap-1">
                          <Laptop className="w-3.5 h-3.5" />
                          {sess.device}
                        </span>
                      </div>
                    </div>
                  </div>

                  {sess.active ? (
                    <button
                      onClick={() => revokeSession(sess.admin)}
                      className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      title="Revoke session credentials"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className={`text-[10px] font-mono font-bold uppercase shrink-0 ${t.textMuted}`}>Expired</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={`p-4 border-t bg-black/5 text-center text-[10px] font-medium ${t.sep} ${t.textMuted}`}>
            Zero-Trust access policies are enforced. Sessions terminate automatically after 15 minutes of inactivity.
          </div>
        </Card>
      </div>

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
export default SecurityView;
