/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { User, Copy, Check, ShieldCheck, Mail, Calendar, Key, Phone } from 'lucide-react';
import { Card } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { Input } from '../ui/Inputs/index.tsx';
import { Badge } from '../ui/Feedback/index.tsx';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const referralCode = user?.referralCode || 'CEFI-DEFAULT-9821X';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVipLabel = (tier?: string) => {
    if (!tier) return 'VIP 0 - Base';
    if (tier === 'VIP_0') return 'VIP 0 - Standard';
    if (tier === 'VIP_1') return 'VIP 1 - Level 1';
    if (tier === 'VIP_2') return 'VIP 2 - Level 2';
    if (tier === 'VIP_3') return 'VIP 3 - Level 3';
    return tier.replace('_', ' ');
  };

  return (
    <div className="space-y-6 text-left" id="profile-view-tab">
      
      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Details Card */}
        <Card hoverEffect={true} className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-display font-bold text-xl shadow-md shadow-blue-500/15">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : (user?.email ? user.email.slice(0, 2).toUpperCase() : 'CE')}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                  <h3 className="text-base font-display font-extrabold text-gray-950 tracking-tight">
                    {user?.name || (user?.email ? user.email.split('@')[0] : 'Institutional Client')}
                  </h3>
                  <Badge variant="amber">{getVipLabel(user?.vipTier)}</Badge>
                </div>
                <p className="text-xs text-gray-500 font-sans flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" /> {user?.email || 'unverified@cefi.platform'}
                </p>
              </div>
            </div>
            
            <div className="text-left sm:text-right font-sans">
              <span className="text-[10px] font-mono text-gray-400 font-bold block uppercase">Account Authority</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center sm:justify-end mt-0.5">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500 shrink-0" /> Authorized Operator
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Operator Public ID (Read Only)"
              value={user?.userId || 'DS-PENDING'}
              readOnly
              className="bg-gray-50/70 border-gray-200 text-gray-500 font-mono"
            />
            <Input
              label="Authorization UID Key (Read Only)"
              value={user?.uid || 'UID-PENDING'}
              readOnly
              className="bg-gray-50/70 border-gray-200 text-gray-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone (Read Only - Editable in Security Tab)"
              value={user?.phone || 'Not configured'}
              readOnly
              icon={<Phone className="w-4 h-4 text-gray-400" />}
              className="bg-gray-50/70 border-gray-200 text-gray-500 font-sans"
            />
            <Input
              label="Wallet Liquid Balance (Read Only)"
              value={user?.walletBalance !== undefined ? `$${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : '$0.00 USD'}
              readOnly
              className="bg-gray-50/70 border-gray-200 text-gray-500 font-sans font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">Enrollment Timestamp</span>
                <span className="text-xs font-bold text-gray-950 font-mono block">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'} UTC
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-start space-x-3">
              <Key className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">Credential Status</span>
                <span className="text-xs font-bold text-gray-950 block">
                  JWT Signature Active & Synced
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Affiliate Copy Card */}
        <Card hoverEffect={true} className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Node Growth Controls
            </span>
            <h4 className="text-sm font-display font-extrabold text-gray-950 tracking-tight">
              Your Referral Hub
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Expand your network by distributing your secure multi-sig affiliate key to verified operators.
            </p>
          </div>

          {/* Core Code block */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-gray-950">{referralCode}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-100 cursor-pointer shadow-3xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-50 text-[10px] font-mono text-gray-400">
            <span>Commission rate: 5% direct, 3% level B, 2% C, 1% D.</span>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default ProfileView;
