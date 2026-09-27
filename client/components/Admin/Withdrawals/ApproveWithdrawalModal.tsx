/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Wallet,
  AlertCircle,
  RefreshCw,
  Send,
  Zap,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ThemeTokens } from '../../ui/themeTokens.ts';
import { AdminWithdrawal } from '../types.ts';
import { api } from '../../../services/api.ts';

export interface ApproveWithdrawalModalProps {
  withdrawal: AdminWithdrawal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  t: ThemeTokens;
  isDark: boolean;
}

export const ApproveWithdrawalModal: React.FC<ApproveWithdrawalModalProps> = ({
  withdrawal,
  isOpen,
  onClose,
  onSuccess,
  t,
  isDark,
}) => {
  const [payoutMode, setPayoutMode] = useState<'manual' | 'auto'>('manual');
  const [txHash, setTxHash] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Reset state when modal opens or target changes
  useEffect(() => {
    if (isOpen) {
      setPayoutMode('manual');
      setTxHash('');
      setNotes('');
      setErrorMessage(null);
      setCopiedAddress(false);
      setCopiedAmount(false);
    }
  }, [isOpen, withdrawal?.id]);

  if (!isOpen || !withdrawal) return null;

  // Calculate clean transfer amount string
  const transferAmount =
    withdrawal.netAmount ||
    (() => {
      const parsed = parseFloat((withdrawal.amount || '').replace(/[^0-9.]/g, '')) || 0;
      return `$${(parsed * 0.9).toFixed(2)}`;
    })();

  const cleanTransferAmountNumber = transferAmount.replace(/[^0-9.]/g, '');

  const handleCopyAddress = () => {
    if (!withdrawal.wallet) return;
    navigator.clipboard.writeText(withdrawal.wallet);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(cleanTransferAmountNumber);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTxHash(text.trim());
      }
    } catch {
      // Clipboard read permission might be blocked
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanHash = txHash.trim();

    if (payoutMode === 'manual') {
      if (!cleanHash) {
        setErrorMessage('Please enter the Transaction Hash (TxID) from your external wallet.');
        return;
      }
      if (cleanHash.length < 10) {
        setErrorMessage('Invalid Transaction Hash. Please enter a valid blockchain transaction ID.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.approveAdminWithdrawal(
        withdrawal.id,
        payoutMode === 'manual' ? cleanHash : undefined,
        notes.trim() || (payoutMode === 'manual' ? 'Manual payout via external wallet' : 'Auto payout via Hot Wallet')
      );

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error?.message || 'Failed to approve withdrawal. Please verify and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during approval.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-gray-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${t.sep}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Approve Withdrawal Payout</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {withdrawal.displayId || withdrawal.reference || withdrawal.id} • {withdrawal.user}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Details Overview Card */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-gray-50 border-gray-200/70'}`}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Debit Amount (Gross)
                </span>
                <span className="text-sm font-bold font-mono text-rose-500/80 dark:text-rose-400/80 line-through">
                  {withdrawal.amount}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider block flex items-center gap-1">
                  <span>Transfer Amount (Net)</span>
                  <span className="text-[9px] px-1 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    -10% FEE
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold font-mono text-emerald-500">
                    {transferAmount} USDT
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAmount}
                    className="p-1 rounded text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer"
                    title="Copy Amount"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="pt-2 border-t border-gray-200/50 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Destination Wallet ({withdrawal.network || 'USDT'})
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
              <div
                className={`p-2.5 rounded-lg font-mono text-xs break-all select-all flex items-center justify-between gap-2 ${
                  isDark ? 'bg-black/30 border border-white/5 text-gray-200' : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <span>{withdrawal.wallet}</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Payout Execution Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/10 dark:bg-white/5 border border-white/5">
              <button
                type="button"
                onClick={() => setPayoutMode('manual')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  payoutMode === 'manual'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Manual (MetaMask / Trust)</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMode('auto')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  payoutMode === 'auto'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto (Hot Wallet)</span>
              </button>
            </div>
          </div>

          {/* Mode Specific Section */}
          {payoutMode === 'manual' ? (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Send <strong>{transferAmount} USDT</strong> to the user's destination address using your MetaMask or Trust Wallet, then paste the confirmed <strong>Transaction Hash (TxID)</strong> below.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">
                    Transaction Hash (TxID) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="text-[11px] font-semibold text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    Paste from Clipboard
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x... or confirmed transaction hash"
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs border outline-none transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:bg-white/10'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">
                  Admin Note <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sent via Admin MetaMask Ledger"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  The backend will attempt to sign and broadcast this withdrawal automatically via the platform's Hot Wallet. Ensure your Hot Wallet has sufficient gas tokens (BNB / POL) and USDT balance.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">
                  Admin Note <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Auto broadcast approved by Admin"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200/50 dark:border-white/5">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : payoutMode === 'manual' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Manual Payout</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Dispatch Auto Payout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
