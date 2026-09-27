/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc, gte, notInArray, sql } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { transactions } from '../../src/db/schema.ts';

export class TransactionRepository {
  /**
   * Find a transaction by its sequential database ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(transactions).where(eq(transactions.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve transaction from ledger.');
    }
  }

  /**
   * Find all transactions linking to a specific source entity or reference code
   */
  async findByReferenceId(referenceId: string) {
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(eq(transactions.referenceId, referenceId));
      return result;
    } catch (error) {
      console.error('Database query (findByReferenceId) failed:', error);
      throw new Error('Failed to retrieve transactions by reference ID.');
    }
  }

  /**
   * Get transactions for a user with pagination and optional filters (type, status, startDate, excludeTypes)
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
      status?: string;
      startDate?: Date;
      excludeTypes?: string[];
    }
  ) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const type = options?.type;
      const status = options?.status;
      const startDate = options?.startDate;
      const excludeTypes = options?.excludeTypes;

      let query = db.select().from(transactions).$dynamic();
      const conditions = [eq(transactions.userId, userId)];

      if (type) {
        conditions.push(eq(transactions.type, type));
      }
      if (excludeTypes && excludeTypes.length > 0) {
        conditions.push(notInArray(transactions.type, excludeTypes));
      }
      if (status) {
        conditions.push(eq(transactions.status, status));
      }
      if (startDate) {
        conditions.push(gte(transactions.createdAt, startDate));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user transactions ledger.');
    }
  }

  /**
   * Write a new immutable transaction entry into the financial ledger
   */
  async createTransaction(data: {
    userId: string;
    walletId: string;
    type: string;
    referenceId: string;
    status?: string;
    description: string;
    amount: string;
    balanceBefore: string;
    balanceAfter: string;
    createdBy?: string;
    createdAt?: Date;
  }) {
    try {
      const insertValues: any = {
        userId: data.userId,
        walletId: data.walletId,
        type: data.type,
        referenceId: data.referenceId,
        status: data.status || 'COMPLETED',
        description: data.description,
        amount: data.amount,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        createdBy: data.createdBy || 'SYSTEM',
      };
      if (data.createdAt) {
        insertValues.createdAt = data.createdAt;
      }

      const result = await db
        .insert(transactions)
        .values(insertValues)
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createTransaction) failed:', error);
      throw new Error('Failed to record immutable transaction ledger entry.');
    }
  }

  /**
   * Update transaction by its reference ID (e.g. status update or description with txHash)
   */
  async updateByReferenceId(
    referenceId: string,
    data: {
      status?: string;
      description?: string;
      createdAt?: Date;
    }
  ) {
    try {
      const updateValues: any = {};
      if (data.status) updateValues.status = data.status;
      if (data.description) updateValues.description = data.description;
      if (data.createdAt) updateValues.createdAt = data.createdAt;

      const result = await db
        .update(transactions)
        .set(updateValues)
        .where(eq(transactions.referenceId, referenceId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateByReferenceId) failed:', error);
      throw new Error('Failed to update transaction by reference ID.');
    }
  }

  /**
   * Synchronize timestamps between transactions and withdrawals table
   * so transactions reflect the backend's single source of truth (withdrawals.createdAt).
   */
  async syncWithdrawalTimestamps(): Promise<number> {
    try {
      const result = await db.execute(sql`
        UPDATE transactions
        SET created_at = withdrawals.created_at
        FROM withdrawals
        WHERE transactions.type = 'WITHDRAWAL'
          AND (transactions.reference_id = withdrawals.reference OR transactions.reference_id = withdrawals.id::text)
          AND transactions.created_at != withdrawals.created_at;
      `);
      const rowCount = (result as any)?.rowCount ?? 0;
      if (rowCount > 0) {
        console.log(`[TransactionRepository] Synced ${rowCount} withdrawal transaction timestamp(s) with backend withdrawals.`);
      }
      return rowCount;
    } catch (error: any) {
      console.warn('[TransactionRepository] Non-fatal: syncWithdrawalTimestamps error:', error.message);
      return 0;
    }
  }

  /**
   * Get system-wide transaction logs with pagination and optional filters (audit panel)
   */
  async findAll(options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
  }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const type = options?.type;
      const status = options?.status;

      let query = db.select().from(transactions).$dynamic();
      const conditions = [];

      if (type) {
        conditions.push(eq(transactions.type, type));
      }
      if (status) {
        conditions.push(eq(transactions.status, status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to retrieve system transactions ledger.');
    }
  }
}

export const transactionRepository = new TransactionRepository();
export default transactionRepository;
