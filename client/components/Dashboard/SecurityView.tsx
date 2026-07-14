/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { Card } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { Input, PasswordInput } from '../ui/Inputs/index.tsx';
import { Badge } from '../ui/Feedback/index.tsx';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  Eye, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Smartphone, 
  Laptop, 
  Globe, 
  Clock, 
  User, 
  Phone, 
  Mail,
  AlertTriangle,
  RotateCw,
  LogOut
} from 'lucide-react';

interface UserSession {
  id: string;
  device: string | null;
  browser: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActivity: string;
}

interface SecuritySummary {
  passwordChangedAt: string | null;
  failedLoginAttempts: number;
  accountLockStatus: string;
  currentLoginDevice: string | null;
  lastLoginTime: string | null;
  lastLoginIp: string | null;
}

export const SecurityView: React.FC = () => {
  const { user, token, syncProfile } = useAuth();
  
  // Tab control
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'email' | 'sessions'>('profile');

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Email Form States
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Sessions and Summary States
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsSuccess, setSessionsSuccess] = useState('');
  const [sessionsError, setSessionsError] = useState('');

  // Password strength checker helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-gray-200', textColor: 'text-gray-400' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  // Synchronize profile data and fetch sessions / summary on mount
  useEffect(() => {
    if (token) {
      fetchSecuritySummary();
      fetchSessionsList();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const fetchSecuritySummary = async () => {
    try {
      const res = await fetch('/api/v1/users/security/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setSummary(body.data);
        }
      }
    } catch (err) {
      console.error('Failed to load security summary:', err);
    }
  };

  const fetchSessionsList = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/v1/users/security/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setSessions(body.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await fetch('/api/v1/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Failed to update profile information.');
      }

      setProfileSuccess('Profile information updated successfully.');
      await syncProfile();
    } catch (err: any) {
      setProfileError(err.message || 'An error occurred.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdSuccess('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
      setPwdLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/users/security/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Failed to update credentials.');
      }

      setPwdSuccess('Your account password was updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSecuritySummary();
      await syncProfile();
    } catch (err: any) {
      setPwdError(err.message || 'An error occurred.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailSuccess('');
    setEmailError('');

    try {
      const res = await fetch('/api/v1/users/security/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: emailPassword, newEmail })
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Failed to change email.');
      }

      setEmailSuccess('Your account email has been updated successfully.');
      setEmailPassword('');
      setNewEmail('');
      await syncProfile();
    } catch (err: any) {
      setEmailError(err.message || 'An error occurred.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleLogoutOthers = async () => {
    setSessionsLoading(true);
    setSessionsSuccess('');
    setSessionsError('');

    try {
      const res = await fetch('/api/v1/users/security/sessions/logout-all-others', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ refreshToken: localStorage.getItem('metafirm_token') })
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Failed to terminate sessions.');
      }

      setSessionsSuccess('All other active sessions have been invalidated successfully.');
      fetchSessionsList();
      fetchSecuritySummary();
    } catch (err: any) {
      setSessionsError(err.message || 'An error occurred.');
    } finally {
      setSessionsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left" id="security-view-tab">
      
      {/* 1. Header Banner & Audit Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Security Health Card */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">System Rating</span>
            <h4 className="text-xl font-display font-extrabold text-gray-950 flex items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mr-1.5 animate-pulse" />
              A+ Secure
            </h4>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono font-bold mt-2 block">
            Cryptographic Node Binded
          </span>
        </Card>

        {/* Password Last Changed */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Password Rotation</span>
            <h4 className="text-xs font-bold text-gray-800">
              {summary?.passwordChangedAt 
                ? new Date(summary.passwordChangedAt).toLocaleString() 
                : 'Never changed'}
            </h4>
          </div>
          <span className="text-[10px] text-gray-400 font-sans mt-2 block">
            Automatic expires every 90 days
          </span>
        </Card>

        {/* Failed Login Attempts */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Login Security</span>
            <h4 className="text-base font-extrabold text-gray-950">
              {summary?.failedLoginAttempts ?? 0} Attempts
            </h4>
          </div>
          <span className={`text-[10px] font-bold font-mono mt-2 block ${summary?.accountLockStatus === 'LOCKED' ? 'text-red-500' : 'text-emerald-500'}`}>
            Status: {summary?.accountLockStatus === 'LOCKED' ? '● LOCKED OUT' : '● ACTIVE / NORMAL'}
          </span>
        </Card>

        {/* Current Node IP */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Last Login Node</span>
            <h4 className="text-xs font-mono font-bold text-gray-800">
              {summary?.lastLoginIp || 'Unknown Node'}
            </h4>
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-2 block">
            Time: {summary?.lastLoginTime ? new Date(summary.lastLoginTime).toLocaleTimeString() : 'N/A'}
          </span>
        </Card>

      </div>

      {/* 2. Sub-tab Navigation */}
      <div className="flex border-b border-gray-100 gap-6">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeSubTab === 'profile' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveSubTab('password')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeSubTab === 'password' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
        >
          Change Password
        </button>
        <button
          onClick={() => setActiveSubTab('email')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeSubTab === 'email' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
        >
          Update Registered Email
        </button>
        <button
          onClick={() => setActiveSubTab('sessions')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeSubTab === 'sessions' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-800'} flex items-center`}
        >
          Active Sessions
          {sessions.length > 1 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] rounded-full font-black">
              {sessions.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. Render Sub-view Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main interactive panel left */}
        <div className="lg:col-span-8">
          
          {activeSubTab === 'profile' && (
            <Card hoverEffect={true} className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-sm font-display font-extrabold text-gray-950">Operator Profile Information</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                  Update your contact details and display identity within the platform.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                  {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-semibold flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-red-500 shrink-0" />
                  {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Display Name / Institution" 
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User className="w-4 h-4 text-gray-400" />}
                  />
                  <Input 
                    label="Contact Phone Number" 
                    placeholder="e.g. +1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" disabled={profileLoading}>
                    {profileLoading ? 'Sealing Profile...' : 'Update Operator Profile'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeSubTab === 'password' && (
            <Card hoverEffect={true} className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-sm font-display font-extrabold text-gray-950">Update Account Password</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                  Input your existing password and specify a strong uppercase-alphanumeric replacement key.
                </p>
              </div>

              {pwdSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                  {pwdSuccess}
                </div>
              )}

              {pwdError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-semibold flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-red-500 shrink-0" />
                  {pwdError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <PasswordInput 
                  label="Current Password" 
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required 
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <PasswordInput 
                      label="New Secure Password" 
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required 
                    />

                    {/* Live Password Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-1.5 p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-gray-500 font-sans">Credential Strength:</span>
                          <span className={strength.textColor}>{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${strength.color}`} 
                            style={{ width: `${(strength.score / 5) * 100}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-gray-400 font-sans leading-relaxed space-y-0.5">
                          <div className="flex items-center">
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            At least 8 characters
                          </div>
                          <div className="flex items-center">
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            One uppercase letter
                          </div>
                          <div className="flex items-center">
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${/[a-z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            One lowercase letter
                          </div>
                          <div className="flex items-center">
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${/\d/.test(newPassword) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            One number
                          </div>
                          <div className="flex items-center">
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(newPassword) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            One special character
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <PasswordInput 
                    label="Confirm New Password" 
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" disabled={pwdLoading || strength.score < 5}>
                    {pwdLoading ? 'Encrypting Credentials...' : 'Seal New Password'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeSubTab === 'email' && (
            <Card hoverEffect={true} className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-sm font-display font-extrabold text-gray-950">Update Registered Email Address</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                  Verify your current password to synchronize a different secure email inbox to this node.
                </p>
              </div>

              {emailSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                  {emailSuccess}
                </div>
              )}

              {emailError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-semibold flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-red-500 shrink-0" />
                  {emailError}
                </div>
              )}

              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordInput 
                    label="Current Password" 
                    placeholder="••••••••••••"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    required 
                  />
                  <Input 
                    label="New Email Address" 
                    placeholder="operator@domain.com"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                    required 
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" disabled={emailLoading || !newEmail || !emailPassword}>
                    {emailLoading ? 'Re-binding Identity...' : 'Confirm Email Update'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeSubTab === 'sessions' && (
            <Card hoverEffect={true} className="space-y-6">
              <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-display font-extrabold text-gray-950">Active Session Monitor</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans mt-0.5">
                    View and manage other web terminals and locations currently connected to your profile.
                  </p>
                </div>
                {sessions.length > 1 && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    className="shrink-0 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border-red-100"
                    onClick={handleLogoutOthers}
                    disabled={sessionsLoading}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Terminate Other Sessions
                  </Button>
                )}
              </div>

              {sessionsSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                  {sessionsSuccess}
                </div>
              )}

              {sessionsError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-semibold flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-red-500 shrink-0" />
                  {sessionsError}
                </div>
              )}

              {sessionsLoading && sessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-mono animate-pulse flex items-center justify-center space-x-2">
                  <RotateCw className="w-4 h-4 animate-spin text-gray-400" />
                  <span>Loading active connections...</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sessions.map((session, index) => {
                    // Match some icons
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(session.device || '');
                    const isCurrent = index === 0; // Simple heuristic: first item returned is sorted desc by activity

                    return (
                      <div key={session.id} className="py-4 flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3.5">
                          <div className={`p-2.5 rounded-xl border ${isCurrent ? 'bg-blue-50/50 border-blue-100 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-950">
                                {session.browser || 'Unknown Browser'} on {session.device || 'Unknown System'}
                              </span>
                              {isCurrent && (
                                <Badge variant="primary" className="text-[9px] py-0 px-1.5 font-bold">Current Device</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono flex-wrap">
                              <span className="flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                IP: {session.ipAddress || '127.0.0.1'}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Registered: {new Date(session.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

        </div>

        {/* Informative Side Info Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card hoverEffect={true} className="p-5 bg-blue-50/20 border border-blue-100/50 text-left space-y-3">
            <div className="flex items-center space-x-2 text-blue-700">
              <Key className="w-4 h-4" />
              <h5 className="text-xs font-bold font-display">Cryptographic Session Lock</h5>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Your operator session is synced under strict, multi-device secure hashes. Password rotation and logout flags propagate instantly across our distributed node nodes.
            </p>
            <Badge variant="primary" className="font-mono text-[9px] uppercase">Active SHA-256 Auth</Badge>
          </Card>

          <Card hoverEffect={true} className="p-5 bg-amber-50/20 border border-amber-100/50 text-left space-y-3">
            <div className="flex items-center space-x-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <h5 className="text-xs font-bold font-display">Account Security Advice</h5>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Never share your credentials keys, passwords, or recovery codes with any third-party. The MetaFirm support team will never request your private security keys.
            </p>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default SecurityView;
