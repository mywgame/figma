/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Wallet, X, ArrowDownRight, ShieldCheck } from 'lucide-react';

export interface DepositSuccessModalProps {
  isOpen: boolean;
  amount: string;
  network?: string;
  onClose: () => void;
}

export const DepositSuccessModal: React.FC<DepositSuccessModalProps> = ({
  isOpen,
  amount,
  network = 'USDT',
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedAmount = parseFloat(amount || '0').toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  const formattedNetwork = network
    .replace('USDT_', '')
    .replace('USDT', '')
    .trim() || 'USDT';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 id=deposit-success-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-[32px] p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.18)] relative z-10 overflow-hidden text-center text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Success Badge */}
          <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 flex items-center justify-center relative shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          {/* Header Title */}
          <div className="space-y-1 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified On-Chain</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              Deposit Successful
            </h3>
          </div>

          {/* Main Amount & Credit Message */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 my-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
              <span>+{formattedAmount}</span>
              <span className="text-sm font-sans font-bold text-gray-300">USDT</span>
            </div>
            <p className="text-xs text-gray-300 font-medium">
              {formattedAmount} {formattedNetwork} USDT has been successfully verified.
            </p>
          </div>

          {/* Wallet Target Note */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400/90 mb-6 bg-emerald-500/5 py-2 px-3 rounded-xl border border-emerald-500/15">
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Balance has been credited to your Main Wallet.</span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Great, Thanks!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DepositSuccessModal;
