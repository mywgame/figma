/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../../src/db/index.ts';
import { treasuryWallets, treasurySweepJobs, depositAddresses } from '../../../../src/db/schema.ts';
import { activeBlockchainProvider } from '../../providers/index.ts';
import { logger } from '../../../utils/logger.ts';
import { auditRepository } from '../../../repositories/auditRepository.ts';
import { keyManager } from '../../keys/KeyManager.ts';
import { gasCalculator } from '../GasCalculator.ts';

export class SweepExecutionService {
  constructor(private readonly provider = activeBlockchainProvider) {}

  /**
   * Sweep funds from a specific user deposit address to the Hot Wallet
   */
  async sweepUserDepositAddress(
    addressId: string,
    activeHotAddress: string,
    adminUid: string = 'SYSTEM'
  ) {
    const addressRecord = await db
      .select()
      .from(depositAddresses)
      .where(eq(depositAddresses.id, addressId))
      .limit(1);

    if (addressRecord.length === 0) {
      throw new Error(`User deposit address record not found: ${addressId}`);
    }

    const addr = addressRecord[0];
    const amountFloat = parseFloat(addr.onChainBalance);
    if (amountFloat <= 0) {
      throw new Error(`Deposit address ${addr.address} has no positive balance to sweep.`);
    }

    const amountStr = addr.onChainBalance;

    logger.info(
      `[SweepExecutionService] Commencing sweep for address ${addr.address} (${amountStr} USDT) to Hot Wallet ${activeHotAddress}`
    );

    const job = await db
      .insert(treasurySweepJobs)
      .values({
        network: addr.network,
        sourceAddress: addr.address,
        destinationAddress: activeHotAddress,
        sweepType: 'USER_TO_HOT',
        amount: amountStr,
        status: 'PENDING',
        attempts: 1,
      })
      .returning();

    const jobId = job[0].id;
    let txHash: string | null = null;

    try {
      await db
        .update(treasurySweepJobs)
        .set({ status: 'IN_PROGRESS', updatedAt: new Date() })
        .where(eq(treasurySweepJobs.id, jobId));

      if (addr.derivationIndex === null || addr.derivationIndex === undefined) {
        throw new Error(`Deposit address ${addr.address} does not have a derivation index assigned.`);
      }

      const childPrivateKey = await keyManager.derivePrivateKey(addr.network, addr.derivationIndex);

      // Verify native gas balance and fund gas if required
      const nativeBal = await this.provider.getNativeBalance(addr.network, addr.address);
      const gasCheck = await gasCalculator.calculateTopUpNeeded(addr.network, nativeBal);
      if (!gasCheck.isSufficient) {
        logger.info(
          `[SweepExecutionService] Funding gas top-up of ${gasCheck.topUpNeeded} ${gasCheck.gasSymbol} to ${addr.address} before sweeping`
        );
        await this.provider.fundGas(addr.network, addr.address, gasCheck.topUpNeeded);
      }

      txHash = await this.provider.broadcastTransaction(
        addr.network,
        activeHotAddress,
        amountStr,
        childPrivateKey
      );

      await db.transaction(async (tx) => {
        await tx
          .update(treasurySweepJobs)
          .set({
            status: 'COMPLETED',
            txHash: txHash!,
            updatedAt: new Date(),
          })
          .where(eq(treasurySweepJobs.id, jobId));

        await tx
          .update(depositAddresses)
          .set({
            onChainBalance: '0.00000000',
            updatedAt: new Date(),
          })
          .where(eq(depositAddresses.id, addressId));

        // Update hot wallet balance in DB
        const twRecord = await tx
          .select()
          .from(treasuryWallets)
          .where(eq(treasuryWallets.network, addr.network))
          .limit(1);

        if (twRecord.length > 0) {
          const currentHotFloat = parseFloat(twRecord[0].hotBalance || '0');
          const newHotStr = (currentHotFloat + amountFloat).toFixed(8);
          await tx
            .update(treasuryWallets)
            .set({
              hotBalance: newHotStr,
              updatedAt: new Date(),
            })
            .where(eq(treasuryWallets.network, addr.network));
        }
      });

      logger.info(`[SweepExecutionService] Sweep COMPLETED for address ${addr.address}. TxHash: ${txHash}`);

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: addr.userId,
        action: 'TREASURY_SWEEP_USER_TO_HOT',
        resource: `treasury/jobs/${jobId}`,
        oldValue: amountStr,
        newValue: txHash!,
      });

      return { success: true, jobId, txHash };
    } catch (err: any) {
      logger.error(`[SweepExecutionService] Sweep FAILED for address ${addr.address}: ${err.message}`);

      // If txHash exists, broadcast succeeded; record txHash to prevent re-broadcasting
      await db
        .update(treasurySweepJobs)
        .set({
          status: txHash ? 'COMPLETED' : 'FAILED',
          txHash: txHash || null,
          errorMessage: err.message,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      if (txHash) {
        // Clear address balance in DB since broadcast went through
        await db
          .update(depositAddresses)
          .set({ onChainBalance: '0.00000000', updatedAt: new Date() })
          .where(eq(depositAddresses.id, addressId));

        return { success: true, jobId, txHash };
      }

      return { success: false, jobId, error: err.message };
    }
  }
}

export const sweepExecutionService = new SweepExecutionService();
