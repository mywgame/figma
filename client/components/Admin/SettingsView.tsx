/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Save,
  Info,
  RefreshCw,
  AlertTriangle,
  Download,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Input } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { api } from '../../services/api.ts';

interface SettingsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ t, isDark }) => {
  // Mobile APK Force Update State
  const [minApkVersion, setMinApkVersion] = useState('2.0.2');
  const [latestApkVersion, setLatestApkVersion] = useState('2.0.2');
  const [apkDownloadUrl, setApkDownloadUrl] = useState('https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/android/metafirm-v2.0.2.apk');
  const [apkReleaseNotes, setApkReleaseNotes] = useState('MetaFirm v2.0.2: Security updates, performance enhancements, and improved trading node connectivity.');
  const [forceUpdateEnabled, setForceUpdateEnabled] = useState(true);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminSettings();
      if (res.success && Array.isArray(res.data)) {
        const settingsMap = new Map<string, any>();
        res.data.forEach((s: any) => settingsMap.set(s.key, s));

        // APK Versioning
        if (settingsMap.has('MIN_REQUIRED_APK_VERSION')) setMinApkVersion(settingsMap.get('MIN_REQUIRED_APK_VERSION').value);
        if (settingsMap.has('LATEST_APK_VERSION')) setLatestApkVersion(settingsMap.get('LATEST_APK_VERSION').value);
        if (settingsMap.has('APK_DOWNLOAD_URL')) setApkDownloadUrl(settingsMap.get('APK_DOWNLOAD_URL').value);
        if (settingsMap.has('APK_UPDATE_RELEASE_NOTES')) setApkReleaseNotes(settingsMap.get('APK_UPDATE_RELEASE_NOTES').value);
        if (settingsMap.has('FORCE_UPDATE_ENABLED')) setForceUpdateEnabled(settingsMap.get('FORCE_UPDATE_ENABLED').value === 'true');
      } else {
        setError(res.error?.message || 'Failed to fetch APK version configurations.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await Promise.all([
        api.updateAdminSetting('MIN_REQUIRED_APK_VERSION', minApkVersion.trim()),
        api.updateAdminSetting('LATEST_APK_VERSION', latestApkVersion.trim()),
        api.updateAdminSetting('APK_DOWNLOAD_URL', apkDownloadUrl.trim()),
        api.updateAdminSetting('APK_UPDATE_RELEASE_NOTES', apkReleaseNotes.trim()),
        api.updateAdminSetting('FORCE_UPDATE_ENABLED', forceUpdateEnabled ? 'true' : 'false'),
      ]);

      // Dispatch event to notify any live dashboard instances
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metafirm_apk_updated', {
          detail: {
            latestVersion: latestApkVersion.trim(),
            downloadUrl: apkDownloadUrl.trim()
          }
        }));
      }

      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save APK settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            <span>Android APK Release &amp; Update Console</span>
          </h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Control live Android APK binary packages, target versions, direct Cloudflare R2 download endpoints, and forced update policies.
          </p>
        </div>
        <Button onClick={fetchSettings} variant="secondary" className="flex items-center gap-1.5 px-3 py-2 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" onClick={fetchSettings} className="px-3 py-1 text-xs">
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Settings Inputs */}
        <Card className="lg:col-span-8 p-6">
          {loading ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Loading APK release configurations...</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Android APK Versioning & Force Update Control */}
              <div className="space-y-4">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm">
                        Android APK Versioning &amp; Force Update Control
                      </h3>
                      <p className={`text-[11px] ${t.textMuted}`}>
                        Configure live distribution packages for all Android mobile users.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={forceUpdateEnabled}
                      onChange={e => setForceUpdateEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={forceUpdateEnabled ? 'text-emerald-500 font-bold' : 'text-gray-400'}>
                      {forceUpdateEnabled ? 'Force Update Active' : 'Force Update Disabled'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Required APK Version"
                    value={minApkVersion}
                    onChange={e => setMinApkVersion(e.target.value)}
                    placeholder="2.0.2"
                    required
                  />
                  <Input
                    label="Latest Available APK Version"
                    value={latestApkVersion}
                    onChange={e => setLatestApkVersion(e.target.value)}
                    placeholder="2.0.2"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Direct APK Package Download URL"
                    value={apkDownloadUrl}
                    onChange={e => setApkDownloadUrl(e.target.value)}
                    placeholder="https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/android/metafirm-v2.0.2.apk"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Release Highlights / Changelog (Shown in App Update Modal)
                  </label>
                  <textarea
                    rows={3}
                    value={apkReleaseNotes}
                    onChange={e => setApkReleaseNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono"
                    placeholder="Describe key improvements, security patches, or backend connection updates..."
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Changes apply globally across Web and Android clients instantly.</span>
                </div>
                <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save className="w-4 h-4" />}>
                  {saving ? 'Saving & Deploying...' : 'Save APK Configurations'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Right Info card */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4 text-xs">
            <h4 className="font-display font-bold text-xs flex items-center gap-2 text-emerald-500 uppercase tracking-wider">
              <Info className="w-4 h-4 text-emerald-500" />
              <span>APK Distribution Guidelines</span>
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  Direct Download CDN
                </span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>
                  Point your APK download URL to a fast CDN (e.g. Cloudflare R2 bucket) for direct, uninterrupted mobile package downloads.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Force Update Policy
                </span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>
                  When enabled, installed apps below the <strong>Minimum Required APK Version</strong> will be prompted with a non-dismissible update screen directing users to download the latest APK build.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">Dashboard Download Button</span>
                <p className={`leading-relaxed text-[11px] ${t.textSub}`}>
                  The dashboard <strong>"Get MetaFirm App"</strong> badge displays the <strong>Latest Available APK Version</strong> tag and routes direct downloads to this configured link.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {isToastOpen && (
        <Toast
          message="Android APK configurations updated and published successfully."
          variant="success"
          onClose={() => setIsToastOpen(false)}
        />
      )}
    </div>
  );
};
export default SettingsView;

