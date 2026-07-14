/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { incomeRepository } from '../repositories/incomeRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';

export class IncomeService {
  /**
   * Helper to write a new income log entry for auditing and analytics grouping
   */
  async recordIncome(data: {
    userId: string;
    walletId: string;
    type: string; // e.g., 'REFERRAL', 'DAILY_YIELD', 'TEAM_INCOME', 'INCENTIVE'
    amount: string;
    description: string;
    transactionId: string;
  }) {
    return incomeRepository.createIncome(data);
  }

  /**
   * Get paginated income history logs for a user
   */
  async getUserIncomeHistory(
    userId: string,
    options?: { limit?: number; offset?: number; type?: string }
  ) {
    return incomeRepository.findByUserId(userId, options);
  }

  /**
   * Retrieve structured total summary metrics for user dashboard display card
   * Categorizes aggregate earnings exactly as defined in Section 10:
   * - Referral Income (REFERRAL)
   * - Daily Yield (DAILY_YIELD)
   * - Team Income (TEAM_INCOME)
   * - Incentive Income (INCENTIVE, SALARY, Weekly Salary, Rewards, etc.)
   */
  async getUserIncomeSummary(userId: string) {
    const summaryList = await incomeRepository.getIncomeSummaryByUserId(userId);
    
    let referralIncome = 0;
    let dailyYield = 0;
    let teamIncome = 0;
    let incentiveIncome = 0;

    for (const item of summaryList) {
      const amount = parseFloat(item.totalAmount || '0.0');
      switch (item.type) {
        case 'REFERRAL':
          referralIncome += amount;
          break;
        case 'DAILY_YIELD':
          dailyYield += amount;
          break;
        case 'TEAM_INCOME':
          teamIncome += amount;
          break;
        default:
          // Any other income type (SALARY, INCENTIVE, AIRDROP, REWARD, manual adjustments, etc.)
          // is grouped under Incentive Income as per Section 10 rules.
          incentiveIncome += amount;
          break;
      }
    }

    return {
      referralIncome: referralIncome.toFixed(8),
      dailyYield: dailyYield.toFixed(8),
      teamIncome: teamIncome.toFixed(8),
      incentiveIncome: incentiveIncome.toFixed(8),
      totalEarned: (referralIncome + dailyYield + teamIncome + incentiveIncome).toFixed(8),
    };
  }
}

export const incomeService = new IncomeService();
export default incomeService;
