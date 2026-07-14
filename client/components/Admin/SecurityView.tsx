/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Key, Shield, Eye, Settings, Terminal, Activity } from 'lucide-react';
import { Card } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';

interface SecurityViewProps {
  onAuditLog: (action: string, module: 'SECURITY') => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ onAuditLog }) => {
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.0/24, 10.0.0.0/8, 127.0.0.1');
  const [enforceTwoFactor, setEnforceTwoFactor] = useState(true);
  const [hsmState, setHsmState] = useState<'NOMINAL' | 'LOCKED' | 'SYNCING'>('NOMINAL');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);

    setTimeout(() => {
      setUpdating(false);
      setSuccess(true);
      onAuditLog(`Synchronized zero-trust security settings. Whitelisted IPs: [${ipWhitelist}]. 2FA Enforced: ${enforceTwoFactor}`, 'SECURITY');
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const securityIncidents = [
    { event: 'Root Access Token Issued', level: 'INFO', ip: '192.168.1.45', time: '2026-06-28 15:42:10 UTC' },
    { event: 'HSM Cryptographic Key Synced', level: 'INFO', ip: 'Local Host', time: '2026-06-28 12:00:00 UTC' },
    { event: 'Unauthorized Access Blocked', level: 'WARNING', ip: '45.120.44.2', time: '2026-06-27 22:15:34 UTC' },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl">
      
      {/* Risk Metrics banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">HSM KEYSTORE CHASSIS</span>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-display font-extrabold text-gray-950 text-base">NOMINAL (SECURE)</h3>
          </div>
          <p className="text-[10px] font-mono text-gray-400">HARDWARE ENCLAVE SYNCED</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">SSL / TLS CRYPTO STACK</span>
          <h3 className="font-display font-extrabold text-gray-950 text-base">SHA-256 GCM 2048bit</h3>
          <p className="text-[10px] font-mono text-emerald-600 font-bold">100% TRANSIT COVERAGE</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">ZERO-TRUST AUDITING</span>
          <h3 className="font-display font-extrabold text-gray-950 text-base">Enabled</h3>
          <p className="text-[10px] font-mono text-gray-400">ALL DISPATCHES LOGGED</p>
        </Card>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Security configuration editor */}
        <form onSubmit={handleUpdateSecurity} className="md:col-span-5 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <Shield className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">FIREWALL CONTROLLER</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide">
                Whitelisted Administrator IP Ranges
              </label>
              <textarea
                rows={3}
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none bg-gray-50/20 font-mono resize-none"
                required
              />
              <span className="text-[9px] text-gray-400 font-sans block">
                Committed values must be valid IPv4 addresses or CIDR blocks separated by commas.
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-50 mt-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-950 font-display">Enforce Multi-sig 2FA Checks</span>
                <p className="text-[9px] text-gray-400 font-sans">Mandatory for withdrawal approvals.</p>
              </div>
              <input
                type="checkbox"
                checked={enforceTwoFactor}
                onChange={() => setEnforceTwoFactor(!enforceTwoFactor)}
                className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 bg-gray-50 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            {success && (
              <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Security Policies Sync Succeeded
              </span>
            )}
            <Button
              type="submit"
              isLoading={updating}
              className="w-full text-xs font-bold py-3 rounded-2xl"
              leftIcon={<Key className="w-3.5 h-3.5" />}
            >
              Commit Firewalls & Keys
            </Button>
          </div>
        </form>

        {/* Real-time incident logs list */}
        <div className="md:col-span-7 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <Terminal className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">REAL-TIME ACCESS FEED</h3>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {securityIncidents.map((inc, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-2.5 text-left text-xs font-mono">
                  {inc.level === 'WARNING' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-grow">
                    <div className="flex justify-between text-[10px]">
                      <span className={`font-bold ${inc.level === 'WARNING' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        [{inc.level}]
                      </span>
                      <span className="text-gray-400 font-semibold">{inc.time}</span>
                    </div>
                    <p className="text-gray-800 font-bold font-sans mt-0.5">{inc.event}</p>
                    <span className="text-[10px] text-gray-400 font-bold block">IP Origin: {inc.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-50 text-center flex items-center justify-center gap-1 text-[9px] font-mono text-gray-400 font-bold">
            <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            SECURE REPLICATED NETWORKING LOGS ACTIVE
          </div>
        </div>

      </div>

    </div>
  );
};
