/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { depositAddresses } from '../../src/db/schema.ts';

export class DepositAddressRepository {
  /**
   * Find all generated deposit addresses for a user
   */
  async findByUserId(userId: string) {
    try {
      const result = await db
        .select()
        .from(depositAddresses)
        .where(eq(depositAddresses.userId, userId));
      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to retrieve deposit addresses.');
    }
  }

  /**
   * Find a specific deposit address for a user on a given blockchain network
   */
  async findByUserAndNetwork(userId: string, network: string) {
    try {
      const result = await db
        .select()
        .from(depositAddresses)
        .where(
          and(
            eq(depositAddresses.userId, userId),
            eq(depositAddresses.network, network)
          )
        );
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByUserAndNetwork) failed:', error);
      throw new Error('Failed to retrieve network deposit address.');
    }
  }

  /**
   * Find a deposit address by the generated public crypto address
   * This maps incoming blockchain payments back to a specific user/account.
   */
  async findByAddress(address: string) {
    try {
      const result = await db
        .select()
        .from(depositAddresses)
        .where(eq(depositAddresses.address, address));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByAddress) failed:', error);
      throw new Error('Failed to retrieve deposit address from database.');
    }
  }

  /**
   * Create and record a new permanent deposit address for a user
   */
  async createDepositAddress(data: {
    userId: string;
    network: string;
    address: string;
  }) {
    try {
      const result = await db
        .insert(depositAddresses)
        .values({
          userId: data.userId,
          network: data.network,
          address: data.address,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createDepositAddress) failed:', error);
      throw new Error('Failed to store generated deposit address.');
    }
  }
}

export const depositAddressRepository = new DepositAddressRepository();
export default depositAddressRepository;
