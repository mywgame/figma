/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { withdrawalRepository } from '../repositories/withdrawalRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { vipService } from './vipService.ts';

export class WithdrawalService {
  /**
   * Request / Initiate a new pending withdrawal
   */
  async createWithdrawal(
    userId: string,
    amountStr: string,
    walletAddress: string,
    network: string
  ) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }

    const amount = parseFloat(amountStr);
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be strictly positive.');
    }

    // Load MIN_WITHDRAWAL_LIMIT from system settings
    const minConfig = await settingsRepository.findSystemSettingByKey('MIN_WITHDRAWAL_LIMIT');
    const minLimit = minConfig ? parseFloat(minConfig.value) : 10.0; // Default: 10 USDT
    if (amount < minLimit) {
      throw new Error(`Minimum withdrawal limit is ${minLimit} USDT.`);
    }

    // Check balance
    const availableBalance = parseFloat(wallet.availableBalance);
    if (availableBalance < amount) {
      throw new Error(`Insufficient funds. Available: ${wallet.availableBalance} USDT, Requested: ${amountStr} USDT.`);
    }

    // Calculate withdrawal fee (e.g. 10%)
    const feeConfig = await settingsRepository.findSystemSettingByKey('WITHDRAWAL_FEE_PERCENTAGE');
    const feeRate = feeConfig ? parseFloat(feeConfig.value) : 0.10; // Default: 10%
    const fee = amount * feeRate;
    const netAmount = amount - fee;

    // Generate reference code
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
    const reference = `WTH${randomDigits}`;

    // Safely debit available balance, and transfer it to locked_balance while pending approval
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: (-amount).toFixed(8),
      lockedBalance: amount.toFixed(8),
    });

    const withdrawal = await withdrawalRepository.createWithdrawal({
      userId,
      walletId: wallet.id,
      amount: amount.toFixed(8),
      fee: fee.toFixed(8),
      netAmount: netAmount.toFixed(8),
      walletAddress,
      network,
      reference,
      status: 'PENDING',
      adminApprovalStatus: 'PENDING',
    });

    // Audit Log — Business Logic Spec Section 14 requires every Withdrawal to be audited.
    await auditRepository.createAuditLog({
      actorUid: userId,
      userId,
      action: 'WITHDRAWAL_REQUESTED',
      resource: `withdrawals/${withdrawal.id}`,
      newValue: JSON.stringify({ amount: amount.toFixed(8), fee: fee.toFixed(8), netAmount: netAmount.toFixed(8), network }),
    });

    return withdrawal;
  }

  /**
   * Approve and complete a pending withdrawal
   */
  async approveWithdrawal(withdrawalId: string, txHash: string, adminUid: string) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }

    if (withdrawal.status !== 'PENDING') {
      throw new Error(`Withdrawal is already completed/rejected with status: ${withdrawal.status}`);
    }

    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    // 1. Mark status as completed and approved
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, 'COMPLETED', {
      txHash,
      adminApprovalStatus: 'APPROVED',
      adminNotes: `Approved by administrator: ${adminUid}`,
    });

    const amount = parseFloat(withdrawal.amount);

    // 2. Clear locked balance, and record history cumulative withdrawal
    await walletRepository.incrementBalances(wallet.id, {
      lockedBalance: (-amount).toFixed(8),
      totalWithdrawn: amount.toFixed(8),
    });

    // 3. Record immutable ledger entry
    const balanceBefore = parseFloat(wallet.availableBalance) + amount; // before withdrawal initiation
    const balanceAfter = parseFloat(wallet.availableBalance);

    await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'WITHDRAWAL',
      referenceId: withdrawal.id,
      status: 'COMPLETED',
      description: `Completed withdrawal of ${withdrawal.amount} USDT (Fee: ${withdrawal.fee} USDT, Net: ${withdrawal.netAmount} USDT) to ${withdrawal.walletAddress}.`,
      amount: withdrawal.amount,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: adminUid,
    });

    // 4. Create Success notification
    await notificationRepository.createNotification({
      userId,
      message: `Your withdrawal request of ${withdrawal.amount} USDT has been completed successfully.`,
      priority: 'HIGH',
    });

    // 5. Recalculate VIP tier — VipService is the single source of truth for VIP logic.
    await vipService.recalculateVip(userId);

    return updatedWithdrawal;
  }

  /**
   * Reject and refund a pending withdrawal
   */
  async rejectWithdrawal(withdrawalId: string, reason: string, adminUid: string) {
    const withdrawal = await withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error(`Withdrawal not found for ID: ${withdrawalId}`);
    }

    if (withdrawal.status !== 'PENDING') {
      throw new Error(`Withdrawal has already been processed with status: ${withdrawal.status}`);
    }

    const userId = withdrawal.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    // 1. Mark status as REJECTED
    const updatedWithdrawal = await withdrawalRepository.updateStatus(withdrawalId, 'REJECTED', {
      adminApprovalStatus: 'REJECTED',
      adminNotes: `Rejected by administrator ${adminUid}. Reason: ${reason}`,
    });

    const amount = parseFloat(withdrawal.amount);

    // 2. Refund the locked balance back to available balance
    await walletRepository.incrementBalances(wallet.id, {
      lockedBalance: (-amount).toFixed(8),
      availableBalance: amount.toFixed(8),
    });

    // 3. Create rejection notification
    await notificationRepository.createNotification({
      userId,
      message: `Your withdrawal request of ${withdrawal.amount} USDT was rejected. Reason: ${reason}. Funds have been refunded to your available balance.`,
      priority: 'HIGH',
    });

    return updatedWithdrawal;
  }
}

export const withdrawalService = new WithdrawalService();
export default withdrawalService;
