/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { depositRepository } from '../../repositories/depositRepository.ts';
import { walletRepository } from '../../repositories/walletRepository.ts';
import { transactionRepository } from '../../repositories/transactionRepository.ts';
import { referralRepository } from '../../repositories/referralRepository.ts';
import { notificationService } from '../../services/notificationService.ts';
import { settingsRepository } from '../../repositories/settingsRepository.ts';
import { userRepository } from '../../repositories/userRepository.ts';
import { vipService } from '../../services/vipService.ts';
import { auditRepository } from '../../repositories/auditRepository.ts';
import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';
import { db } from '../../../src/db/index.ts';
import { depositAddresses } from '../../../src/db/schema.ts';
import { eq, sql, and } from 'drizzle-orm';
import { treasuryService } from './TreasuryService.ts';
import { sweepQueueProcessor } from './SweepQueueProcessor.ts';

export class DepositService {
  constructor(private readonly provider: BlockchainProvider = activeBlockchainProvider) {}

  /**
   * Initiate a pending deposit request
   */
  async createDeposit(
    userId: string,
    amount: string,
    network: string,
    depositAddress: string,
    txHash?: string | null
  ) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }

    if (parseFloat(amount) <= 0) {
      throw new Error('Deposit amount must be strictly positive.');
    }

    // Generate a unique reference number (e.g. DEP followed by random digits)
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
    const referenceNumber = `DEP${randomDigits}`;

    const deposit = await depositRepository.createDeposit({
      userId,
      walletId: wallet.id,
      referenceNumber,
      amount,
      network,
      depositAddress,
      txHash,
      status: 'PENDING',
    });

    return deposit;
  }

  /**
   * Complete and verify a pending deposit (e.g., from admin review or webhooks)
   */
  async processSuccessfulDeposit(depositId: string, txHash?: string, adminUid?: string) {
    const deposit = await depositRepository.findById(depositId);
    if (!deposit) {
      throw new Error(`Deposit record not found for ID: ${depositId}`);
    }

    if (deposit.status !== 'PENDING') {
      throw new Error(`Deposit has already been processed with status: ${deposit.status}`);
    }

    const userId = deposit.userId;
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    // 1. Mark deposit as COMPLETED
    const updatedDeposit = await depositRepository.updateStatus(depositId, 'COMPLETED', {
      txHash: txHash || deposit.txHash || undefined,
      adminNotes: adminUid ? `Manually completed by admin ${adminUid}` : undefined,
    });

    const depositAmount = parseFloat(deposit.amount);

    // 2. Safely capture balance before
    const balanceBefore = parseFloat(wallet.availableBalance);
    const balanceAfter = balanceBefore + depositAmount;

    // 3. Increment main wallet balances atomically
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: deposit.amount,
      principalBalance: deposit.amount,
      totalDeposited: deposit.amount,
    });

    // 4. Create transactional ledger entry
    await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'DEPOSIT',
      referenceId: deposit.id,
      status: 'COMPLETED',
      description: `Successful deposit of ${deposit.amount} USDT via ${deposit.network}.`,
      amount: deposit.amount,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: adminUid || 'SYSTEM',
    });

    // 5. Send transaction success notification
    await notificationService.createStructuredNotification(userId, {
      title: 'Deposit Successful',
      description: `Your deposit of ${deposit.amount} USDT has been credited successfully.`,
      icon: 'ArrowDownCircle',
      type: 'deposit',
      priority: 'HIGH',
    });

    // 5b. Audit Log
    await auditRepository.createAuditLog({
      actorUid: adminUid || 'SYSTEM',
      userId,
      action: 'DEPOSIT_COMPLETED',
      resource: `deposits/${deposit.id}`,
      oldValue: 'PENDING',
      newValue: JSON.stringify({ amount: deposit.amount, network: deposit.network, balanceAfter: balanceAfter.toFixed(8) }),
    });

    // 6. Handle Referral Rewards: Generated ONLY ONCE on their First Successful REAL Deposit
    await this.processReferralReward(userId, deposit.amount, deposit.id, adminUid || 'SYSTEM');

    // 7. Recalculate VIP tier
    await vipService.recalculateVip(userId);

    // 8. Update on-chain balance of the associated permanent deposit address & check auto-sweep
    try {
      const dbAddr = await db
        .select()
        .from(depositAddresses)
        .where(
          and(
            eq(depositAddresses.address, deposit.depositAddress),
            eq(depositAddresses.network, deposit.network)
          )
        )
        .limit(1);

      if (dbAddr.length > 0) {
        const addressId = dbAddr[0].id;
        const currentOnChain = parseFloat(dbAddr[0].onChainBalance || '0.00000000');
        const newOnChain = (currentOnChain + depositAmount).toFixed(8);

        await db
          .update(depositAddresses)
          .set({
            onChainBalance: newOnChain,
            updatedAt: new Date(),
          })
          .where(eq(depositAddresses.id, addressId));

        // Register deposit for Sweep Queue State Machine
        await sweepQueueProcessor.registerDeposit(depositId);
      }
    } catch (err: any) {
      console.error('[DepositService] Failed to update on-chain deposit address balance:', err.message);
    }

    return updatedDeposit;
  }

  /**
   * Internal helper to process referral rewards for upline parent
   */
  private async processReferralReward(childId: string, depositAmountStr: string, depositId: string, actor: string) {
    try {
      const childWallet = await walletRepository.findByUserId(childId);
      if (!childWallet) return;

      // Ensure it is indeed their first successful deposit
      const totalDepositedVal = parseFloat(childWallet.totalDeposited) + parseFloat(depositAmountStr);
      if (totalDepositedVal > parseFloat(depositAmountStr)) {
        // Already deposited in the past
        return;
      }

      // Check if child has a parent relationship
      const relationship = await referralRepository.findRelationshipByChildId(childId);
      if (!relationship) {
        return; // No referrer parent
      }

      const parentId = relationship.parentId;
      const parentWallet = await walletRepository.findByUserId(parentId);
      if (!parentWallet) return;

      // Determine referral reward percentage from system configurations
      const configKey = 'REFERRAL_REWARD_PERCENTAGE';
      const configSetting = await settingsRepository.findSystemSettingByKey(configKey);
      const rewardRate = configSetting ? parseFloat(configSetting.value) : 0.10; // Default: 10%

      const depositAmount = parseFloat(depositAmountStr);
      const rewardAmount = depositAmount * rewardRate;

      if (rewardAmount <= 0) return;

      const rewardAmountStr = rewardAmount.toFixed(8);

      // Credit parent wallet atomically
      const parentBalanceBefore = parseFloat(parentWallet.availableBalance);
      const parentBalanceAfter = parentBalanceBefore + rewardAmount;

      await walletRepository.incrementBalances(parentWallet.id, {
        availableBalance: rewardAmountStr,
        referralIncome: rewardAmountStr,
        totalEarned: rewardAmountStr,
      });

      // Record transaction ledger entry for parent
      const parentTxn = await transactionRepository.createTransaction({
        userId: parentId,
        walletId: parentWallet.id,
        type: 'REFERRAL_REWARD',
        referenceId: depositId,
        status: 'COMPLETED',
        description: `Referral commission from first deposit of downline (Level ${relationship.referralLevel}).`,
        amount: rewardAmountStr,
        balanceBefore: parentBalanceBefore.toFixed(8),
        balanceAfter: parentBalanceAfter.toFixed(8),
        createdBy: actor,
      });

      // Record into referralIncomeHistory table
      await referralRepository.createReferralIncome({
        userId: parentId,
        sourceUserId: childId,
        depositId,
        amount: rewardAmountStr,
        level: relationship.referralLevel,
        transactionId: parentTxn.id,
      });

      // Notify parent
      await notificationService.createStructuredNotification(parentId, {
        title: 'Referral Reward Received',
        description: `Congratulations! You received a referral reward of ${rewardAmountStr} USDT from a referred user's first deposit.`,
        icon: 'Award',
        type: 'referral',
        priority: 'MEDIUM',
      });

      // Audit Log
      await auditRepository.createAuditLog({
        actorUid: actor,
        userId: parentId,
        action: 'REFERRAL_REWARD_CREDITED',
        resource: `wallets/${parentWallet.id}`,
        newValue: JSON.stringify({ sourceUserId: childId, depositId, level: relationship.referralLevel, amount: rewardAmountStr }),
      });

      // Recalculate VIP for parent too
      await vipService.recalculateVip(parentId);
    } catch (err) {
      console.error(`Failed to process referral rewards for child ${childId}:`, err);
    }
  }
}

export const depositService = new DepositService();
export default depositService;
