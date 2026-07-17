/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Check, Copy, History, Wallet } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { Input } from '../../ui/Inputs/index.tsx';
import { Button } from '../../ui/Buttons/index.tsx';

const MOCK_WITHDRAWAL_HISTORY = [
  {
    id: 'w1',
    dateTime: '2026-07-16 18:22:15',
    network: 'USDT BEP20',
    amount: '100.00',
    status: 'PENDING',
    txNumber: 'WTH-74291845',
    txHash: '0x8b3a5c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6bf12',
  },
  {
    id: 'w2',
    dateTime: '2026-07-12 11:05:30',
    network: 'USDT TRC20',
    amount: '50.00',
    status: 'APPROVED',
    txNumber: 'WTH-28491054',
    txHash: '0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6de9a',
  },
  {
    id: 'w3',
    dateTime: '2026-07-05 08:44:12',
    network: 'USDT Polygon',
    amount: '200.00',
    status: 'APPROVED',
    txNumber: 'WTH-10385921',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
  }
];

const VERIFIED_WITHDRAWAL_ADDRESSES: Record<string, string[]> = {
  USDT_BEP20: [
    '0x72a9df28c9e120fd0e762b3c4d5e6f7a8b9cf82e',
    '0x3f5c6e8d7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d'
  ],
  USDT_POLYGON: [
    '0x9c8b7a6d5e4f3c2b1a0e9f8d7c6b5a4f3e2d1c0b',
    '0x5a4d3c2b1a0e9f8d7c6b5a4f3e2d1c0b9a8f7e6d'
  ],
  USDT_TRC20: [
    'TY1e9f8d7c6b5a4f3e2d1c0b9a8f7e6d5c',
    'TX8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c'
  ],
};

interface WithdrawalViewProps {
  showToast: (msg: string) => void;
  onBack: () => void;
}

export const WithdrawalView: React.FC<WithdrawalViewProps> = ({
  showToast,
  onBack,
}) => {
  const { t } = useTheme();

  const [withdrawNetwork, setWithdrawNetwork] = useState('USDT_BEP20');
  const [selectedWithdrawAddress, setSelectedWithdrawAddress] = useState('');
  const [withdrawAmountState, setWithdrawAmountState] = useState('100');
  const [emailOtp, setEmailOtp] = useState('');
  const [googleAuth2fa, setGoogleAuth2fa] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    const list = VERIFIED_WITHDRAWAL_ADDRESSES[withdrawNetwork] || [];
    setSelectedWithdrawAddress(list[0] || '');
  }, [withdrawNetwork]);

  const handleSendOtp = () => {
    if (isSendingOtp) return;
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      showToast('A verification code has been sent to your registered email address!');
    }, 1500);
  };

  const handleCopyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast('Transaction Hash copied to clipboard!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmountState || parseFloat(withdrawAmountState) <= 0) {
      showToast('Please specify a valid withdrawal amount.');
      return;
    }
    if (!emailOtp || emailOtp.length < 6) {
      showToast('Please provide a valid 6-digit Email OTP.');
      return;
    }
    if (!googleAuth2fa || googleAuth2fa.length < 6) {
      showToast('Please provide a valid 6-digit Google Authenticator code.');
      return;
    }
    
    showToast(`Withdrawal request of ${withdrawAmountState} USDT submitted for admin approval!`);
    setEmailOtp('');
    setGoogleAuth2fa('');
  };

  return (
    <DashboardLayout
      title="Outbound Withdrawal"
      description="Please configure your transaction details to submit an outbound request. Every submission requires administrative verification and dual-factor validation."
      onBack={onBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="withdrawal-view-container">
        
        {/* Left Side: Withdrawal Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Network Selection */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
                Select Blockchain Network
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'USDT_BEP20', label: 'USDT BEP20' },
                  { id: 'USDT_POLYGON', label: 'USDT Polygon' },
                  { id: 'USDT_TRC20', label: 'USDT TRC20' },
                ].map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setWithdrawNetwork(net.id)}
                    className={`py-2 px-3 rounded-2xl text-xs font-mono border transition-all cursor-pointer text-center ${
                      withdrawNetwork === net.id
                        ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-bold'
                        : `${t.cardInner} ${t.textSub} border-transparent`
                    }`}
                  >
                    {net.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Address Select */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase block ${t.textMuted}`}>
                Withdrawal Address
              </span>
              <select
                value={selectedWithdrawAddress}
                onChange={(e) => setSelectedWithdrawAddress(e.target.value)}
                className={`w-full rounded-2xl px-4 py-3 text-xs font-mono font-semibold outline-none transition-all ${t.inset} ${t.text} border border-white/10 ${t.isDark ? 'bg-black/40' : 'bg-gray-100'}`}
              >
                {(VERIFIED_WITHDRAWAL_ADDRESSES[withdrawNetwork] || []).map((addr) => (
                  <option key={addr} value={addr} className={`${t.isDark ? 'bg-[#0e1230] text-white' : 'bg-white text-gray-900'} font-mono text-xs`}>
                    {addr}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-sans">
                <Check className="w-3.5 h-3.5 shrink-0" /> Verified Address from Profile
              </span>
            </div>

            {/* Withdrawal Amount */}
            <Input
              label="Withdrawal Amount (USDT)"
              type="number"
              value={withdrawAmountState}
              onChange={(e) => setWithdrawAmountState(e.target.value)}
              required
            />

            {/* Email OTP Field */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase block ${t.textMuted}`}>
                Email One-Time Password (OTP)
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit Email OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  required
                  maxLength={6}
                  className={`flex-1 rounded-2xl px-4 py-2.5 text-xs font-mono outline-none border border-white/10 ${t.inset} ${t.text} ${t.isDark ? 'bg-black/40' : 'bg-gray-100'}`}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 disabled:opacity-50 cursor-pointer select-none"
                >
                  {isSendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </div>

            {/* Google Authenticator code */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase block ${t.textMuted}`}>
                Google Authenticator (2FA) Code
              </span>
              <input
                type="text"
                placeholder="6-digit Authenticator Code"
                value={googleAuth2fa}
                onChange={(e) => setGoogleAuth2fa(e.target.value)}
                required
                maxLength={6}
                className={`w-full rounded-2xl px-4 py-3 text-xs font-mono outline-none border border-white/10 ${t.inset} ${t.text} ${t.isDark ? 'bg-black/40' : 'bg-gray-100'}`}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/10 border-none py-3 font-sans font-extrabold uppercase tracking-wider text-xs cursor-pointer"
            >
              Submit Withdrawal Request
            </Button>
          </form>
        </div>

        {/* Right Side: Withdrawal History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-1.5 text-amber-400">
            <History className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Withdrawal History
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_WITHDRAWAL_HISTORY.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{item.network}</span>
                  <span className="font-mono text-amber-400 font-bold">{item.amount} USDT</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[10px]">
                  <span>{item.dateTime}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                    item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2 font-mono text-gray-500">
                  <span>TX: {item.txNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyTxHash(item.txHash)}
                    className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Click to copy Hash"
                  >
                    <span>{item.txHash.slice(0, 8)}...{item.txHash.slice(-6)}</span>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default WithdrawalView;
