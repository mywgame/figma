/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { treasuryWallets, depositAddresses } from '../../../../src/db/schema.ts';
import { activeBlockchainProvider } from '../../providers/index.ts';
import { logger } from '../../../utils/logger.ts';

export class WalletSyncService {
  constructor(private readonly provider = activeBlockchainProvider) {}

  /**
   * Refresh and update on-chain token balance for user permanent deposit addresses
   */
  async syncUserDepositAddressesBalance(network: string, addresses: any[], concurrency: number = 3): Promise<void> {
    const cleanNetwork = network.toUpperCase();
    if (!addresses || addresses.length === 0) return;

    for (let i = 0; i < addresses.length; i += concurrency) {
      const batch = addresses.slice(i, i + concurrency);
      await Promise.all(
        batch.map(async (addr) => {
          try {
            const liveBal = await this.provider.getBalance(cleanNetwork, addr.address);
            if (liveBal !== addr.onChainBalance) {
              addr.onChainBalance = liveBal;
              await db
                .update(depositAddresses)
                .set({
                  onChainBalance: liveBal,
                  updatedAt: new Date(),
                })
                .where(eq(depositAddresses.id, addr.id));
            }
          } catch (err: any) {
            logger.warn(
              `[WalletSyncService] Failed to fetch live token balance for address ${addr.address} on ${cleanNetwork}: ${err.message}`
            );
          }
        })
      );

      if (i + concurrency < addresses.length) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
  }

  /**
   * Sync balance for a specific wallet record in DB
   */
  async syncWalletRecordBalance(network: string, walletRecord: any): Promise<string> {
    const cleanNetwork = network.toUpperCase();
    let bal = walletRecord.balance || '0.00000000';
    if (walletRecord.address && walletRecord.status === 'ACTIVE') {
      try {
        bal = await this.provider.getBalance(cleanNetwork, walletRecord.address);
        const updatePayload: Record<string, any> = { balance: bal, updatedAt: new Date() };
        if (walletRecord.walletType === 'HOT') {
          updatePayload.hotBalance = bal;
        } else if (walletRecord.walletType === 'COLD') {
          updatePayload.coldBalance = bal;
        }
        await db
          .update(treasuryWallets)
          .set(updatePayload)
          .where(eq(treasuryWallets.id, walletRecord.id));
      } catch (e: any) {
        logger.warn(
          `[WalletSyncService] Failed to fetch live balance for ${walletRecord.walletType} wallet ${walletRecord.address}: ${e.message}`
        );
      }
    }
    return bal;
  }
}

export const walletSyncService = new WalletSyncService();
