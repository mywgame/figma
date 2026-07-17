/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { walletRepository } from '../repositories/walletRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { activityRepository } from '../repositories/activityRepository.ts';
import { referralService } from './referralService.ts';
import { incomeService } from './incomeService.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { claimRepository } from '../repositories/claimRepository.ts';
import { depositAddressRepository } from '../repositories/depositAddressRepository.ts';
import { claimService } from './claimService.ts';

export class DashboardService {
  /**
   * Aggregate all metrics and states to compile the comprehensive user dashboard payload
   */
  async getDashboardData(userId: string) {
    // 1. Fetch wallet balances and calculations
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const availableBalance = parseFloat(wallet.availableBalance);
    const lockedBalance = parseFloat(wallet.lockedBalance);
    const totalAssets = availableBalance + lockedBalance;

    // 2. Fetch categorized earnings totals
    const earnings = await incomeService.getUserIncomeSummary(userId);

    // 3. Fetch VIP status and matrix eligibility
    let vip = await vipRepository.findByUserId(userId);
    if (!vip) {
      // Lazy init fallback if status was missing
      vip = await vipRepository.createVipStatus({
        userId,
        tier: 'VIP1',
      });
    }

    // 4. Fetch team members statistics
    const descendants = await referralService.getDownlineDescendants(userId);
    
    let levelACount = 0;
    let levelBCount = 0;
    let levelCCount = 0;
    let levelDCount = 0;

    let levelAValidCount = 0;
    let levelBcdValidCount = 0;

    // Resolve descendant wallets to check valid user count
    const descendantWallets = await Promise.all(
      descendants.map(async (d) => {
        const dWallet = await walletRepository.findByUserId(d.childId);
        return {
          referralLevel: d.referralLevel,
          wallet: dWallet,
        };
      })
    );

    for (const dw of descendantWallets) {
      const level = dw.referralLevel;
      if (level === 1) levelACount++;
      else if (level === 2) levelBCount++;
      else if (level === 3) levelCCount++;
      else if (level === 4) levelDCount++;

      if (dw.wallet) {
        const dBalance = parseFloat(dw.wallet.availableBalance) + parseFloat(dw.wallet.lockedBalance);
        if (dBalance >= 50.0) {
          if (level === 1) {
            levelAValidCount++;
          } else if (level >= 2 && level <= 4) {
            levelBcdValidCount++;
          }
        }
      }
    }

    // 5. Fetch recent transactions ledger (Limit 5)
    const recentTransactions = await transactionRepository.findByUserId(userId, { limit: 5 });

    // 6. Fetch recent activity security logs (Limit 5)
    const recentActivities = await activityRepository.findByUserId(userId, { limit: 5 });

    // 7. Check if there's any active DPY yield claim open today, lazy-generating if none exists
    const now = new Date();
    let activeClaims = await claimRepository.findActiveClaimsInWindow(userId, now);
    if (activeClaims.length === 0) {
      const generated = await claimService.generateClaimForUser(userId, now);
      if (generated) {
        activeClaims = [generated];
      }
    }
    const dailyClaimAvailable = activeClaims.length > 0;
    const pendingClaim = dailyClaimAvailable ? activeClaims[0] : null;

    // 8. Load settings for debug trial fund representation
    const trialAmountSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_AMOUNT');
    const trialDurationSetting = await settingsRepository.findSystemSettingByKey('TRIAL_FUND_DURATION_DAYS');

    // 9. Fetch permanent deposit addresses
    const depositAddressesList = await depositAddressRepository.findByUserId(userId);

    return {
      wallet: {
        id: wallet.id,
        availableBalance: wallet.availableBalance,
        lockedBalance: wallet.lockedBalance,
        principalBalance: wallet.principalBalance,
        trialBalance: wallet.trialBalance,
        totalAssets: totalAssets.toFixed(8),
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
      },
      depositAddresses: depositAddressesList.map(da => ({
        network: da.network,
        address: da.address,
      })),
      earnings,
      vip: {
        tier: vip.tier,
        points: vip.points,
        levelAValidCount: vip.levelAValidCount,
        levelBcdValidCount: vip.levelBcdValidCount,
        teamTotalCount: vip.teamTotalCount,
        assignedAt: vip.assignedAt,
      },
      team: {
        levelACount,
        levelBCount,
        levelCCount,
        levelDCount,
        totalReferralCount: levelACount + levelBCount + levelCCount + levelDCount,
        levelAValidCount,
        levelBcdValidCount,
        teamTotalValidCount: levelAValidCount + levelBcdValidCount,
      },
      dailyClaim: {
        available: dailyClaimAvailable && (pendingClaim ? pendingClaim.claimStatus === 'PENDING' : false),
        claimId: pendingClaim ? pendingClaim.id : null,
        amount: pendingClaim ? pendingClaim.rewardAmount : '0.00000000',
        windowClose: pendingClaim ? pendingClaim.claimWindowCloseTime : null,
        status: pendingClaim ? pendingClaim.claimStatus : 'PENDING',
      },
      recentTransactions,
      recentActivities,
      trialFundInfo: {
        amount: trialAmountSetting ? trialAmountSetting.value : '100.00000000',
        durationDays: trialDurationSetting ? parseInt(trialDurationSetting.value) : 7,
        activeTrialBalance: wallet.trialBalance,
      },
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
