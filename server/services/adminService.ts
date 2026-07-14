/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { userRepository } from '../repositories/userRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { supportRepository } from '../repositories/supportRepository.ts';
import { withdrawalService } from './withdrawalService.ts';
import { vipService } from './vipService.ts';

/**
 * BUSINESS RULE — Single Source of Truth:
 * AdminService NEVER re-implements Withdrawal or VIP business logic.
 * - Withdrawal approve/reject is owned EXCLUSIVELY by WithdrawalService.
 * - VIP recalculation is owned EXCLUSIVELY by VipService.
 * AdminService only adds the admin-specific authorization/audit wrapper around them.
 */

export class AdminService {
  /**
   * Adjust user wallet balances atomically (Manual Admin Ledger Adjustment)
   */
  async adjustWalletBalance(
    userId: string,
    deltas: {
      availableBalance?: string;
      lockedBalance?: string;
      principalBalance?: string;
      trialBalance?: string;
      referralIncome?: string;
      dailyYield?: string;
      teamIncome?: string;
      incentiveIncome?: string;
    },
    memo: string,
    adminUid: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const beforeBalance = parseFloat(wallet.availableBalance);
    const availableDelta = parseFloat(deltas.availableBalance || '0.0');
    const afterBalance = beforeBalance + availableDelta;

    // Apply atomic adjustments
    const updatedWallet = await walletRepository.incrementBalances(wallet.id, deltas);

    // Save adjustment inside transaction ledger
    const txn = await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'ADMIN_ADJUST',
      referenceId: wallet.id,
      status: 'COMPLETED',
      description: memo || 'Administrative manual account balance adjustment.',
      amount: availableDelta.toFixed(8),
      balanceBefore: beforeBalance.toFixed(8),
      balanceAfter: afterBalance.toFixed(8),
      createdBy: adminUid,
    });

    // Write audit record
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: 'WALLET_MANUAL_ADJUSTMENT',
      resource: `wallets/${wallet.id}`,
      oldValue: JSON.stringify(wallet),
      newValue: JSON.stringify(updatedWallet),
    });

    // Send notification
    await notificationRepository.createNotification({
      userId,
      message: `Your account balance was adjusted by our support team: "${memo}"`,
      priority: 'MEDIUM',
    });

    // Recalculate VIP tier — VipService is the single source of truth for VIP logic.
    // Business Logic Spec Section 6: VIP recalculates after Wallet Balance Change.
    await vipService.recalculateVip(userId);

    return updatedWallet;
  }

  /**
   * Update a user's account active status (ACTIVE, SUSPENDED, PENDING_VERIFICATION)
   */
  async updateUserStatus(userId: string, status: string, adminUid: string, reason: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Since UserRepository.updateUserProfile only types Partial<{ role: string }> but updates the table,
    // we safely cast parameters to update the status field of the users table.
    const updatedUser = await userRepository.updateUserProfile(user.uid, { status } as any);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: 'USER_STATUS_CHANGE',
      resource: `users/${userId}`,
      oldValue: user.status,
      newValue: status,
    });

    await notificationRepository.createNotification({
      userId,
      message: `Your account status has been updated to ${status}. Reason: ${reason}`,
      priority: 'HIGH',
    });

    return updatedUser;
  }

  /**
   * Administrative Approval of pending Withdrawals.
   * Delegates ALL ledger/wallet/VIP logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async approveWithdrawal(withdrawalId: string, adminUid: string, txHash: string, notes?: string) {
    const updatedW = await withdrawalService.approveWithdrawal(withdrawalId, txHash, adminUid);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: 'WITHDRAWAL_APPROVAL',
      resource: `withdrawals/${updatedW.id}`,
      newValue: notes ? `APPROVED — ${notes}` : 'APPROVED',
    });

    return updatedW;
  }

  /**
   * Administrative Rejection of pending Withdrawals.
   * Delegates ALL ledger/wallet logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async rejectWithdrawal(withdrawalId: string, adminUid: string, notes: string) {
    const updatedW = await withdrawalService.rejectWithdrawal(withdrawalId, notes, adminUid);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: 'WITHDRAWAL_REJECTION',
      resource: `withdrawals/${updatedW.id}`,
      newValue: 'REJECTED',
    });

    return updatedW;
  }

  /**
   * Retrieve platform system wide audit logs
   */
  async getSystemAuditLogs(options?: { limit?: number; offset?: number; action?: string }) {
    return auditRepository.findAll(options);
  }

  /**
   * Fetch all registered users in the platform (paginated, newest first).
   */
  async getAllUsers(options?: { limit?: number; offset?: number }) {
    return userRepository.findAll(options);
  }

  /**
   * Retrieve all platform support tickets
   */
  async getAllSupportTickets(options?: { status?: string; priority?: string; limit?: number; offset?: number }) {
    return supportRepository.findAll(options);
  }
}

export const adminService = new AdminService();
export default adminService;
