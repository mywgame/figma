/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sql } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import { depositAddressRepository } from '../../repositories/depositAddressRepository.ts';
import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';

export class AddressService {
  constructor(private readonly provider: BlockchainProvider = activeBlockchainProvider) {}

  /**
   * Securely and atomically gets the next derivation index for a network using PostgreSQL sequences.
   */
  private async getNextDerivationIndex(network: string): Promise<number> {
    const cleanNetwork = network.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const seqName = `seq_derivation_index_${cleanNetwork}`;
    
    // Ensure sequence exists dynamically (O(1) operation after initial creation)
    await db.execute(sql.raw(`CREATE SEQUENCE IF NOT EXISTS ${seqName} START WITH 1 MINVALUE 1;`));
    
    // Fetch next value atomically from the sequence
    const result = (await db.execute(sql.raw(`SELECT nextval('${seqName}') as val;`))) as any;
    
    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error(`Failed to fetch next value from sequence ${seqName}`);
    }
    
    const val = parseInt(result.rows[0].val, 10);
    // Convert 1-based sequence to 0-based derivation index
    return val - 1;
  }

  /**
   * Retrieves or generates a permanent deposit address for a specific user and network
   */
  async getOrCreateDepositAddress(userId: string, network: string) {
    // 1. Check if the user already has a deposit address on this network
    const existing = await depositAddressRepository.findByUserAndNetwork(userId, network);
    if (existing) {
      return existing;
    }

    // 2. Allocate a unique, sequential derivation index atomically using PG sequences
    const derivationIndex = await this.getNextDerivationIndex(network);

    // 3. Generate the actual address via the provider
    const address = await this.provider.generateDepositAddress(network, derivationIndex);

    // 4. Save permanently to database with duplicate prevention under race conditions
    const qrPath = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(address)}`;
    try {
      const newAddress = await depositAddressRepository.createDepositAddress({
        userId,
        network,
        address,
        derivationIndex,
        qrPath,
      });
      return newAddress;
    } catch (error: any) {
      // Under high concurrency/race conditions, check if another process succeeded
      const existingAgain = await depositAddressRepository.findByUserAndNetwork(userId, network);
      if (existingAgain) {
        return existingAgain;
      }
      throw error;
    }
  }

  /**
   * Validate destination address format on target network
   */
  async validateAddress(network: string, address: string): Promise<boolean> {
    return this.provider.validateAddress(network, address);
  }
}

export const addressService = new AddressService();
export default addressService;

