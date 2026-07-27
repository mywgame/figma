/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Save,
  RotateCcw,
  Clock,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';

interface TrialFundViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const TrialFundView: React.FC<TrialFundViewProps> = ({ t, isDark }) => {
  // Local state representing the configuration settings
  const defaultSettings = {
    amount: '1000',
    duration: '7',
    isEnabled: true,
  };

  const [amount, setAmount] = useState(defaultSettings.amount);
  const [duration, setDuration] = useState(defaultSettings.duration);
  const [isEnabled, setIsEnabled] = useState(defaultSettings.isEnabled);
  
  const [lastUpdated, setLastUpdated] = useState<string>('2026-07-16 14:32:10 UTC');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Checks if the local form state matches the default or simulated saved values
  const hasChanges = isSaved === false;

  const handleFieldChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setIsSaved(false);
  };

  const handleToggleChange = () => {
    setIsEnabled(prev => !prev);
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API request submission
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    
    setLastUpdated(formattedDate);
    setIsSaved(true);
    
    setNotification({
      type: 'success',
      text: `Configuration request submitted successfully! New Trial Fund: ${amount} USDT for ${duration} days (${isEnabled ? 'Enabled' : 'Disabled'}).`
    });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleReset = () => {
    setAmount(defaultSettings.amount);
    setDuration(defaultSettings.duration);
    setIsEnabled(defaultSettings.isEnabled);
    setIsSaved(true);
    
    setNotification({
      type: 'info',
      text: 'Settings restored to official factory defaults.'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-left relative animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-xl font-bold tracking-tight ${t.text}`}>Trial Fund Settings</h2>
            
            {/* Dynamic Status Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider border transition-all ${
              isSaved
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
            }`}>
              {isSaved ? 'Configuration Synced' : 'Draft Changes • Unsaved'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Configure the default trial asset allocation and duration for newly registered platform accounts.
          </p>
        </div>
      </div>

      {/* Interactive Form Chassis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form Body (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications Panel */}
          {notification && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              ) : (
                <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
              )}
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-display">
                  {notification.type === 'success' ? 'System Updated' : 'System Notice'}
                </span>
                <p className={`text-[11px] leading-relaxed ${t.textSub}`}>
                  {notification.text}
                </p>
              </div>
            </div>
          )}

          <Card className="p-6 border border-black/5 dark:border-white/5 relative overflow-hidden">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Inputs Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Trial Amount */}
                <div className="space-y-2 text-left">
                  <label className={`block text-xs font-bold tracking-tight ${t.text}`}>
                    Trial Fund Amount (USDT)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1000"
                      value={amount}
                      onChange={(e) => handleFieldChange(setAmount, e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50'
                      }`}
                    />
                    <span className="absolute right-3.5 top-2.5 text-[10px] font-mono font-extrabold text-blue-500 uppercase">
                      USDT
                    </span>
                  </div>
                  <span className={`block text-[10px] ${t.textMuted}`}>
                    Simulated asset volume issued instantly upon registration.
                  </span>
                </div>

                {/* Trial Duration */}
                <div className="space-y-2 text-left">
                  <label className={`block text-xs font-bold tracking-tight ${t.text}`}>
                    Trial Duration (Days)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="365"
                      placeholder="e.g. 7"
                      value={duration}
                      onChange={(e) => handleFieldChange(setDuration, e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50'
                      }`}
                    />
                    <span className="absolute right-3.5 top-2.5 text-[10px] font-mono font-extrabold text-blue-500 uppercase">
                      Days
                    </span>
                  </div>
                  <span className={`block text-[10px] ${t.textMuted}`}>
                    Number of days trial principal generates interest before expiring.
                  </span>
                </div>

              </div>

              {/* Toggle Switch */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                isEnabled
                  ? (isDark ? 'bg-blue-500/5 border-blue-500/15' : 'bg-blue-50/50 border-blue-100')
                  : (isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100')
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className={`text-xs font-extrabold ${t.text}`}>
                      Enable Trial Fund Program
                    </span>
                  </div>
                  <p className={`text-[10px] ${t.textMuted}`}>
                    When active, newly created profiles will automatically start with the trial amount.
                  </p>
                </div>

                {/* IOS Switch */}
                <button
                  type="button"
                  onClick={handleToggleChange}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/10'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className={`text-[10px] font-mono ${t.textMuted}`}>
                    Last Updated: <span className="font-bold text-gray-400">{lastUpdated}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Reset Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>

                  {/* Save Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    className={`flex items-center gap-1.5 px-5 py-2 ${
                      !hasChanges ? 'opacity-80' : ''
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Configuration
                  </Button>
                </div>
              </div>

            </form>
          </Card>

        </div>

        {/* Informational sidebar context card (1 Col) */}
        <div className="space-y-6">
          
          <Card className="p-6 border border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-amber-500 font-display uppercase tracking-wider">
                  Admin Control Notice
                </h4>
              </div>

              <div className="space-y-3">
                <p className={`text-[11px] leading-relaxed ${t.textSub}`}>
                  This dashboard allows Super Admins to propose updates to registration trials.
                </p>
                
                <div className="space-y-2.5 pt-2 border-t border-amber-500/10">
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className={`text-[11px] leading-normal ${t.textSub}`}>
                      <strong>New Registrants:</strong> These settings apply to all newly registered users automatically upon confirmation of their signup.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className={`text-[11px] leading-normal ${t.textSub}`}>
                      <strong>Backend Validation:</strong> The backend validates and applies the configuration schema during registration cycles.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className={`text-[11px] leading-normal ${t.textSub}`}>
                      <strong>API Proxying:</strong> The frontend only submits configuration requests to the secure admin controller endpoint.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <p className={`text-[11px] leading-normal ${t.textSub}`}>
                      <strong>Zero Client Logic:</strong> No business or calculation logic exists in the frontend to avoid tampered reward events.
                    </p>
                  </div>
                </div>

                <p className={`text-[10px] italic pt-2 ${t.textMuted}`}>
                  Designed in compliance with MetaFirm Master Blueprint Section 4.5. Ready for API integration.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Stats Panel */}
          <Card className="p-4 space-y-3">
            <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest ${t.textMuted}`}>
              Trial Analytics Preview
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 text-left">
                <span className={`block text-[10px] ${t.textMuted}`}>Activated Today</span>
                <span className={`block text-sm font-bold font-display ${t.text}`}>14 Accounts</span>
              </div>
              <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 text-left">
                <span className={`block text-[10px] ${t.textMuted}`}>Est. Trial Yield</span>
                <span className="block text-sm font-bold font-display text-blue-500">112.50 USDT</span>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default TrialFundView;
