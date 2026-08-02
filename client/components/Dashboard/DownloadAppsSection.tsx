/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/index.ts';

const AndroidIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997 0-.551.4482-.9993.9993-.9993.5511 0 .9993.4483.9993.9993 0 .5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997 0-.551.4482-.9993.9993-.9993.5511 0 .9993.4483.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592c.1502-.2603.061-.5931-.1993-.7433-.2602-.1503-.5931-.061-.7433.1993l-2.0233 3.5042C15.3678 8.1632 13.7317 7.747 12 7.747c-1.7317 0-3.3678.4162-4.9127 1.0754L5.064 5.3182c-.1502-.2603-.4831-.3496-.7433-.1993-.2603.1502-.3495.483-.1993.7433l1.9973 3.4592C2.686 11.2312.3428 15.0215.3428 19.3333h23.3144c0-4.3118-2.3432-8.1021-5.7767-9.0119" />
  </svg>
);

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.36-.58.68-1.09 1.77-.95 2.81 1.01.08 2.05-.57 2.67-1.32z" />
  </svg>
);

const ChromeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 3a9 9 0 0 0-7.79 4.5l3.89 6.74A4.5 4.5 0 0 1 12 7.5h7.79A9 9 0 0 0 12 3z" />
    <path fill="#4285F4" d="M12 16.5a4.5 4.5 0 0 1-3.89-2.25L4.22 7.5A9 9 0 0 0 12 21a9 9 0 0 0 7.79-4.5H12z" />
    <path fill="#FBBC05" d="M19.79 7.5H12a4.5 4.5 0 0 1 3.89 2.25l3.89 6.74A9 9 0 0 0 19.79 7.5z" />
    <circle cx="12" cy="12" r="3.5" fill="#FFFFFF" />
    <circle cx="12" cy="12" r="2.8" fill="#1A73E8" />
  </svg>
);

export const DownloadAppsSection: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleDownloadApk = () => {
    setDownloading('apk');
    setDownloadMsg('Preparing APK download...');
    setTimeout(() => {
      setDownloading(null);
      const link = document.createElement('a');
      link.href = '/metafirm-app.apk';
      link.download = 'MetaFirm-Android-v1.0.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadMsg('APK Download started! Install MetaFirm on your device.');
      setTimeout(() => setDownloadMsg(null), 4000);
    }, 1000);
  };

  const handleIosClick = () => {
    setDownloadMsg('iOS App: Available via Safari "Add to Home Screen" & TestFlight.');
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const handlePwaClick = () => {
    setDownloadMsg('Chrome PWA: Bookmark or click "Install MetaFirm" in browser menu.');
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  return (
    <Card className="w-full bg-slate-900/50 border-slate-800/80 p-3.5 sm:p-4 backdrop-blur-md rounded-xl shadow-lg" id="download-apps-section">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Compact Label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <AndroidIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-sans">
                Get MetaFirm App
              </h4>
              <span className="hidden sm:inline-flex px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                v1.0 Official
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline shrink-0" />
              <span>Available for Android, iOS & Chrome Web</span>
            </p>
          </div>
        </div>

        {/* Right: 3 Compact App Buttons with Official Brand Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          {/* Android Button */}
          <button
            onClick={handleDownloadApk}
            disabled={downloading === 'apk'}
            className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-emerald-600/90 hover:text-white text-slate-200 border border-slate-700/60 hover:border-emerald-500/50 text-xs font-medium transition-all group cursor-pointer"
            title="Download Android APK"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors">
                <AndroidIcon className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold">Android APK</div>
                <div className="text-[9px] text-slate-400 group-hover:text-emerald-100">Direct Download</div>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white shrink-0" />
          </button>

          {/* iOS Button */}
          <button
            onClick={handleIosClick}
            className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 text-xs font-medium transition-all group cursor-pointer"
            title="iOS App Info"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-700/40 text-slate-200 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <AppleIcon className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold">iOS (iPhone)</div>
                <div className="text-[9px] text-slate-400">PWA / TestFlight</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Chrome WebApp Button */}
          <button
            onClick={handlePwaClick}
            className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-blue-600/90 hover:text-white text-slate-200 border border-slate-700/60 hover:border-blue-500/50 text-xs font-medium transition-all group cursor-pointer"
            title="Launch Chrome Web App"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                <ChromeIcon className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold">Chrome App</div>
                <div className="text-[9px] text-slate-400 group-hover:text-blue-100">Web / PWA</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-white shrink-0" />
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className="mt-2.5 p-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-3.5 h-3.5 shrink-0 text-blue-400" />
          <span>{downloadMsg}</span>
        </div>
      )}
    </Card>
  );
};

