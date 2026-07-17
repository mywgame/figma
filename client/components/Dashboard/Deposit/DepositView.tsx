/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, Check, Copy, History } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { DashboardLayout } from '../Layout/DashboardLayout.tsx';
import { DashboardData } from '../../../types/index.ts';

const MOCK_DEPOSIT_HISTORY = [
  {
    id: 'd1',
    dateTime: '2026-07-15 14:32:10',
    network: 'USDT BEP20',
    amount: '150.00',
    status: 'SUCCESSFUL',
    txNumber: 'DEP-84920482',
    txHash: '0x2F3a6c9d8e7f1a2b3c4d5e6f7a8b9c0d1e2f3a6cb97',
  },
  {
    id: 'd2',
    dateTime: '2026-07-10 09:15:43',
    network: 'USDT TRC20',
    amount: '500.00',
    status: 'SUCCESSFUL',
    txNumber: 'DEP-39105829',
    txHash: '0x7e8f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e8fd24',
  },
  {
    id: 'd3',
    dateTime: '2026-07-01 11:24:02',
    network: 'USDT Polygon',
    amount: '80.00',
    status: 'SUCCESSFUL',
    txNumber: 'DEP-21948104',
    txHash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d',
  }
];

interface DepositViewProps {
  dashboardData: DashboardData | null;
  showToast: (msg: string) => void;
  onBack: () => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  dashboardData,
  showToast,
  onBack,
}) => {
  const { t } = useTheme();
  const [depositNetwork, setDepositNetwork] = useState('USDT_BEP20');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const getDepositAddress = () => {
    if (!dashboardData || !dashboardData.depositAddresses) return '0x9821c9e2b45a90d1f43a8b32d541';
    const found = dashboardData.depositAddresses.find(da => da.network === depositNetwork);
    return found ? found.address : '0x9821c9e2b45a90d1f43a8b32d541';
  };

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(getDepositAddress());
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast('Transaction Hash copied to clipboard!');
  };

  return (
    <DashboardLayout
      title="USDT Deposit Gateway"
      description="Please transfer USDT only to your assigned deposit address below. Your balance will be automatically credited after network confirmation."
      onBack={onBack}
    >
      <div className="space-y-6 max-w-xl" id="deposit-view-container">
        
        {/* Network Selection */}
        <div className="space-y-2">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
            Select Blockchain Network
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { id: 'USDT_BEP20', label: 'USDT BEP20' },
              { id: 'USDT_POLYGON', label: 'USDT Polygon' },
              { id: 'USDT_TRC20', label: 'USDT TRC20' },
            ].map((net) => (
              <button
                key={net.id}
                type="button"
                onClick={() => setDepositNetwork(net.id)}
                className={`py-2 px-3 rounded-2xl text-xs font-mono border transition-all cursor-pointer text-center ${
                  depositNetwork === net.id
                    ? 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30 font-bold'
                    : `${t.cardInner} ${t.textSub} border-transparent`
                }`}
              >
                {net.label}
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/25 border border-white/5 space-y-2.5 max-w-xs mx-auto sm:mx-0">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getDepositAddress())}`}
            alt="Deposit QR Code"
            className="w-32 h-32 rounded-lg border-4 border-white shadow-md bg-white"
            referrerPolicy="no-referrer"
          />
          <span className={`text-[9px] font-mono uppercase tracking-widest block ${t.textMuted}`}>
            Scan to transfer USDT
          </span>
        </div>

        {/* Deposit Address Box */}
        <div className="space-y-2">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${t.textMuted}`}>
            Your Assigned Deposit Address
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className={`p-3.5 rounded-2xl flex-1 flex items-center font-mono text-xs select-all overflow-hidden ${t.inset} ${t.text}`}>
              <span className="truncate w-full block">{getDepositAddress()}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyWalletAddress}
              className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
            </button>
          </div>
        </div>

        {/* Deposit History */}
        <div className={`pt-6 border-t ${t.sep} space-y-3`}>
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <History className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Deposit History</span>
          </div>
          <div className="space-y-2.5">
            {MOCK_DEPOSIT_HISTORY.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{item.network}</span>
                  <span className="font-mono text-cyan-400 font-bold">{item.amount} USDT</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[10px]">
                  <span>{item.dateTime}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px]">
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2 font-mono text-gray-500">
                  <span>TX: {item.txNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyTxHash(item.txHash)}
                    className="hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
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

export default DepositView;
