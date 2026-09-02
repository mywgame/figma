/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { claimRepository } from '../repositories/claimRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { incomeRepository } from '../repositories/incomeRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { referralService } from './referralService.ts';
import { trialFundService } from './trialFundService.ts';
import { vipService } from './vipService.ts';
import { SecurityLogger } from '../utils/securityLogger.ts';

// Business Logic Spec Section 4 — Trial Fund: "Generates DPY using the VIP1 rate."
// This rate is fixed regardless of the user's actual VIP tier.
const TRIAL_FUND_DPY_RATE = 0.0060;

export class ClaimService {
  /**
   * Helper to determine DPY percentage rate based on VIP tier
   */
  getDpyRateByVip(tier: string): number {
    switch (tier) {
      case 'VIP8': return 0.0250;
      case 'VIP7': return 0.0200;
      case 'VIP6': return 0.0150;
      case 'VIP5': return 0.0130;
      case 'VIP4': return 0.0120;
      case 'VIP3': return 0.0100;
      case 'VIP2': return 0.0080;
      default: return 0.0060; // VIP1 (default)
    }
  }

  /**
   * Calculate current eligible DPY yield and active balance components for a user
   */
  async calculateCurrentEligibleDpy(userId: string, date: Date = new Date()) {
    // Lazily expire the Trial Principal first (Business Logic Spec Section 4) so an
    // already-expired trial balance never generates yield.
    await trialFundService.checkAndExpireTrialFund(userId);

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) return null;

    const vip = await vipRepository.findByUserId(userId);
    const vipTier = vip ? vip.tier : 'VIP1';
    const rate = this.getDpyRateByVip(vipTier);

    // BUSINESS RULE: Daily DPY is generated ONLY on the Active Balance (availableBalance).
    // Locked balance = funds pending withdrawal exit — they are no longer "in the platform"
    // and must NOT keep earning yield until they return to the active wallet (or the
    // withdrawal is rejected and refunded back to availableBalance).
    const activeBalance = parseFloat(wallet.availableBalance);
    const mainComponent = activeBalance * rate;

    // BUSINESS RULE (Section 4 — Trial Fund): Trial Balance generates DPY at the FIXED
    // VIP1 rate, independent of the user's actual VIP tier. Active once claimed and not yet expired.
    const trialBalance = parseFloat(wallet.trialBalance);
    const trialActive = trialBalance > 0 && wallet.trialExpiresAt !== null && new Date(wallet.trialExpiresAt) > date;
    const trialComponent = trialActive ? trialBalance * TRIAL_FUND_DPY_RATE : 0;

    const totalEligibleBalance = activeBalance + (trialActive ? trialBalance : 0);
    const rewardAmount = mainComponent + trialComponent;

    return {
      wallet,
      vipTier,
      vipRate: rate,
      activeBalance,
      trialBalance,
      trialActive,
      totalEligibleBalance,
      rewardAmount,
    };
  }

  /**
   * Generate a pending daily claim record for a single user for a given date
   */
  async generateClaimForUser(userId: string, date: Date = new Date()) {
    const calc = await this.calculateCurrentEligibleDpy(userId, date);
    if (!calc || calc.rewardAmount <= 0) {
      return null; // No assets to generate DPY
    }

    const { vipTier, vipRate, totalEligibleBalance, rewardAmount } = calc;

    // Set today's window bounds (00:00 to 23:59:59 UTC)
    const openTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const closeTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    // Check if a claim already exists for this user inside this window
    const existingClaims = await claimRepository.findAnyClaimInWindow(userId, date);
    if (existingClaims.length > 0) {
      return existingClaims[0]; // Already generated (could be PENDING, CLAIMED, etc.)
    }

    const claim = await claimRepository.createClaim({
      userId,
      claimDate: date,
      claimStatus: 'PENDING',
      rewardAmount: rewardAmount.toFixed(8),
      totalAssets: totalEligibleBalance.toFixed(8),
      vipTier,
      vipRate: vipRate.toFixed(4),
      claimWindowOpenTime: openTime,
      claimWindowCloseTime: closeTime,
    });

    return claim;
  }

  /**
   * Synchronize an existing PENDING claim for today with the user's latest eligible wallet balance.
   * Ensures that if the user deposited funds before claiming, the pending reward and assets
   * immediately reflect their live balance on the dashboard and claim cards.
   */
  async syncPendingClaimForUser(userId: string, date: Date = new Date()) {
    const existingClaims = await claimRepository.findAnyClaimInWindow(userId, date);
    if (!existingClaims || existingClaims.length === 0) {
      return null;
    }

    const pendingClaim = existingClaims.find((c) => c.claimStatus === 'PENDING');
    if (!pendingClaim) {
      return null; // Claim is already CLAIMED, EXPIRED, etc. Do not modify finalized claims!
    }

    const calc = await this.calculateCurrentEligibleDpy(userId, date);
    if (!calc || calc.rewardAmount <= 0) {
      return pendingClaim;
    }

    const newRewardStr = calc.rewardAmount.toFixed(8);
    const newAssetsStr = calc.totalEligibleBalance.toFixed(8);
    const newRateStr = calc.vipRate.toFixed(4);

    // If amounts already match, no update needed
    if (
      pendingClaim.rewardAmount === newRewardStr &&
      pendingClaim.totalAssets === newAssetsStr &&
      pendingClaim.vipTier === calc.vipTier
    ) {
      return pendingClaim;
    }

    const updated = await claimRepository.updatePendingClaimReward(pendingClaim.id, {
      rewardAmount: newRewardStr,
      totalAssets: newAssetsStr,
      vipTier: calc.vipTier,
      vipRate: newRateStr,
    });

    return updated || pendingClaim;
  }

  /**
   * Process manual DPY yield claims triggered by the user
   */
  async claimDailyYield(claimId: string, userId: string) {
    const claim = await claimRepository.findById(claimId);
    if (!claim) {
      throw new Error(`Daily DPY claim record not found for ID: ${claimId}`);
    }

    if (claim.userId !== userId) {
      throw new Error('Unauthorized claim action.');
    }

    if (claim.claimStatus !== 'PENDING') {
      throw new Error(`This claim has already been ${claim.claimStatus.toLowerCase()}.`);
    }

    const now = new Date();
    if (now < claim.claimWindowOpenTime || now > claim.claimWindowCloseTime) {
      throw new Error('This claim window has expired or is not yet open.');
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }

    // Recalculate live eligible DPY at the exact time of claim execution
    // to capture any deposits made prior to claiming on the same day.
    const calc = await this.calculateCurrentEligibleDpy(userId, now);
    const liveRewardAmountStr = (calc && calc.rewardAmount > 0)
      ? calc.rewardAmount.toFixed(8)
      : claim.rewardAmount;
    const liveTotalAssetsStr = (calc && calc.totalEligibleBalance > 0)
      ? calc.totalEligibleBalance.toFixed(8)
      : claim.totalAssets;
    const liveVipTier = calc?.vipTier || claim.vipTier;
    const liveVipRateStr = calc ? calc.vipRate.toFixed(4) : claim.vipRate;

    // 1. Atomically lock and transition claim status to CLAIMED with the finalized live reward amount
    const lockedClaim = await claimRepository.updateClaimStatus(
      claim.id,
      'CLAIMED',
      {
        claimedAt: now,
        rewardAmount: liveRewardAmountStr,
        totalAssets: liveTotalAssetsStr,
        vipTier: liveVipTier,
        vipRate: liveVipRateStr,
      },
      'PENDING'
    );

    if (!lockedClaim) {
      throw new Error('This claim has already been processed or is no longer pending.');
    }

    const rewardAmount = parseFloat(lockedClaim.rewardAmount);
    const balanceBefore = parseFloat(wallet.availableBalance);
    const balanceAfter = balanceBefore + rewardAmount;

    // 2. Credit main wallet balances atomically
    await walletRepository.incrementBalances(wallet.id, {
      availableBalance: lockedClaim.rewardAmount,
      dailyYield: lockedClaim.rewardAmount,
      totalEarned: lockedClaim.rewardAmount,
    });

    // 3. Create immutable transaction ledger entry
    const txn = await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'DAILY_YIELD',
      referenceId: lockedClaim.id,
      status: 'COMPLETED',
      description: `Claimed daily DPY yield: ${lockedClaim.rewardAmount} USDT (VIP rate: ${(parseFloat(lockedClaim.vipRate) * 100).toFixed(2)}%).`,
      amount: lockedClaim.rewardAmount,
      balanceBefore: balanceBefore.toFixed(8),
      balanceAfter: balanceAfter.toFixed(8),
      createdBy: 'SYSTEM',
    });

    // 4. Save inside incomeHistory
    await incomeRepository.createIncome({
      userId,
      walletId: wallet.id,
      type: 'DAILY_YIELD',
      amount: lockedClaim.rewardAmount,
      description: `Daily DPY yield matching VIP tier ${lockedClaim.vipTier}`,
      transactionId: txn.id,
    });

    // 5. Update transactionId in Claim record
    const updatedClaim = await claimRepository.updateClaimStatus(lockedClaim.id, 'CLAIMED', {
      transactionId: txn.id,
    });

    // 6. Trigger notifications
    await notificationRepository.createNotification({
      userId,
      message: `Successfully claimed daily yield of ${lockedClaim.rewardAmount} USDT.`,
      priority: 'MEDIUM',
    });

    // 6b. Audit Log — Business Logic Spec Section 14 requires every Daily DPY Claim to be audited.
    await auditRepository.createAuditLog({
      actorUid: userId,
      userId,
      action: 'DAILY_DPY_CLAIMED',
      resource: `claims/${lockedClaim.id}`,
      oldValue: JSON.stringify({ initialReward: claim.rewardAmount, initialAssets: claim.totalAssets }),
      newValue: JSON.stringify({
        rewardAmount: lockedClaim.rewardAmount,
        totalAssets: lockedClaim.totalAssets,
        vipTier: lockedClaim.vipTier,
        vipRate: lockedClaim.vipRate,
        balanceAfter: balanceAfter.toFixed(8),
      }),
    });

    // 7. Team Commission distribution (Level A-D uplines) — owned EXCLUSIVELY by
    // ReferralService (Section 17 — Service Ownership Matrix). ClaimService never
    // calculates or distributes Team Commission itself.
    await referralService.distributeTeamCommission(userId, rewardAmount, lockedClaim.id);

    // 8. Recalculate VIP tier for user and uplines (Business Logic Spec Section 6: VIP recalculates after Wallet Balance Change)
    await vipService.recalculateUserAndUplines(userId);

    return updatedClaim || lockedClaim;
  }

  /**
   * Automatically expire any unclaimed Daily DPY claims past their 00:00 UTC window close.
   * Business Logic Spec Section 11: "Unclaimed DPY expires at the next 00:00 UTC reset."
   * A fresh claim is generated separately by generateClaimForUser() on the next cycle.
   */
  async expireUnclaimedClaims(date: Date = new Date()) {
    let expiredCount = 0;
    try {
      const expiredClaims = await claimRepository.findExpiredPendingClaims(date);

      for (const claim of expiredClaims) {
        await claimRepository.updateClaimStatus(claim.id, 'EXPIRED', {
          expired: true,
        });

        await notificationRepository.createNotification({
          userId: claim.userId,
          message: `Your Daily DPY reward of ${claim.rewardAmount} USDT expired unclaimed and has been forfeited.`,
          priority: 'LOW',
        });

        expiredCount++;
      }
    } catch (err) {
      console.error('Failed to expire unclaimed rewards:', err);
    }
    return { expiredCount };
  }
}

export const claimService = new ClaimService();
export default claimService;
