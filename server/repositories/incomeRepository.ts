/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { incomeHistory } from '../../src/db/schema.ts';

export class IncomeRepository {
  /**
   * Find an income record by its unique database ID
   */
  async findById(id: string) {
    try {
      const result = await db
        .select()
        .from(incomeHistory)
        .where(eq(incomeHistory.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve income history record.');
    }
  }

  /**
   * Get all income records for a specific user with pagination and optional type filter
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
    }
  ) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const type = options?.type;

      let query = db.select().from(incomeHistory).$dynamic();
      const conditions = [eq(incomeHistory.userId, userId)];

      if (type) {
        conditions.push(eq(incomeHistory.type, type));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(incomeHistory.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user income history ledger.');
    }
  }

  /**
   * Record a new credit/earning income event
   */
  async createIncome(data: {
    userId: string;
    walletId: string;
    type: string;
    amount: string;
    description: string;
    transactionId: string;
  }) {
    try {
      const result = await db
        .insert(incomeHistory)
        .values({
          userId: data.userId,
          walletId: data.walletId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          transactionId: data.transactionId,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createIncome) failed:', error);
      throw new Error('Failed to record income history ledger entry.');
    }
  }

  /**
   * Get aggregate metrics of user earnings grouped by income category type
   */
  async getIncomeSummaryByUserId(userId: string) {
    try {
      const result = await db
        .select({
          type: incomeHistory.type,
          totalAmount: sql<string>`sum(${incomeHistory.amount})`,
        })
        .from(incomeHistory)
        .where(eq(incomeHistory.userId, userId))
        .groupBy(incomeHistory.type);
      return result;
    } catch (error) {
      console.error('Database query (getIncomeSummaryByUserId) failed:', error);
      throw new Error('Failed to compute user income aggregation.');
    }
  }
}

export const incomeRepository = new IncomeRepository();
export default incomeRepository;
