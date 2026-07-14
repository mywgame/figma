/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, ShieldCheck, Globe, HelpCircle, Save, AlertTriangle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { Card } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { Input, Select, ToggleSwitch } from '../ui/Inputs/index.tsx';

export interface SystemSettings {
  platformName: string;
  businessTimezone: string;
  minDeposit: number;
  minWithdrawal: number;
  maintenanceMode: boolean;
}

interface SettingsViewProps {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
  userRole?: string;
  token?: string | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, userRole, token }) => {
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [businessTimezone, setBusinessTimezone] = useState(settings.businessTimezone);
  const [minDeposit, setMinDeposit] = useState(settings.minDeposit);
  const [minWithdrawal, setMinWithdrawal] = useState(settings.minWithdrawal);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    // Front-end validation checks
    if (!currentPassword) {
      setPwdError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setPwdError('New password is required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    // Password validation requirements
    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPwdError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPwdError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setPwdError('Password must contain at least one number.');
      return;
    }
    if (!/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(newPassword)) {
      setPwdError('Password must contain at least one special character.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/v1/users/security/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('metafirm_token')}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || body.message || 'Failed to rotate secret keys.');
      }

      setPwdSuccess('Your SUPERADMIN credentials have been rotated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'An unexpected error occurred.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    
    // Simulate API delay
    setTimeout(() => {
      onSave({
        platformName,
        businessTimezone,
        minDeposit: Number(minDeposit),
        minWithdrawal: Number(minWithdrawal),
        maintenanceMode,
      });
      setSaving(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1000);
  };

  const timezoneOptions = [
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'America/New_York', label: 'Eastern Standard Time (EST / New York)' },
    { value: 'Europe/London', label: 'London Financial Time (GMT / BST)' },
    { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT / Asia)' },
    { value: 'Asia/Tokyo', label: 'Tokyo Financial Clock (JST / Japan)' }
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl">
      
      {/* Settings form container */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Banner if maintenance mode is active */}
        {maintenanceMode && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900 font-display">System Maintenance Mode Armed</h4>
              <p className="text-[11px] text-gray-500 font-sans leading-normal">
                All client facing logins and trades are blocked. Multi-signature gateways remain active. Public pages will display the maintenance screen.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Platform Config card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <Settings className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">PLATFORM BRAND IDENTIFIER</h3>
            </div>

            <Input
              label="Enterprise Platform Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              required
            />

            <Select
              label="Business Operations Timezone"
              options={timezoneOptions}
              value={businessTimezone}
              onChange={(e) => setBusinessTimezone(e.target.value)}
              required
            />
          </Card>

          {/* Operational thresholds card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <Globe className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">CLEARING RISK THRESHOLDS</h3>
            </div>

            <Input
              label="Minimum Inbound Deposit Threshold (USD)"
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(Number(e.target.value))}
              required
            />

            <Input
              label="Minimum Outbound Withdrawal Limit (USD)"
              type="number"
              value={minWithdrawal}
              onChange={(e) => setMinWithdrawal(Number(e.target.value))}
              required
            />
          </Card>

        </div>

        {/* System switches */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">SYSTEM DEPLOYMENT STATUS</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-950 font-display">Enforce Global Maintenance Mode</span>
              <p className="text-[10px] text-gray-400 max-w-md font-sans leading-relaxed">
                Blocks public endpoints. Restricts access exclusively to authenticated ROOT networks and approved system administrators.
              </p>
            </div>
            <ToggleSwitch
              checked={maintenanceMode}
              onChange={() => setMaintenanceMode(!maintenanceMode)}
            />
          </div>
        </Card>

        {/* Success feedbacks */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {successMsg && (
              <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                System Constants Sync Succeeded
              </span>
            )}
          </div>
          <Button
            type="submit"
            isLoading={saving}
            className="px-6 py-3 text-xs font-bold rounded-2xl"
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Commit Configurations
          </Button>
        </div>

      </form>

      {/* Superadmin Password Management Section */}
      {(userRole === 'SUPERADMIN' || (userRole && userRole.toUpperCase() === 'SUPERADMIN')) && (
        <div className="pt-6 border-t border-gray-100">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">SUPERADMIN CREDENTIAL ROTATION</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {pwdError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-700">{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-700">{pwdSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Password Field */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none bg-gray-50/20 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none bg-gray-50/20 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none bg-gray-50/20 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-gray-50/50">
                <span className="text-[10px] text-gray-400 font-sans max-w-lg leading-relaxed block">
                  Password security protocols require at least 8 characters with at least one uppercase, lowercase, number, and special character.
                </span>
                <Button
                  type="submit"
                  isLoading={changingPassword}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl cursor-pointer bg-amber-500 hover:bg-amber-600 text-white"
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                >
                  Rotate Secret Key
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
