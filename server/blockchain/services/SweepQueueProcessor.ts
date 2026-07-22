/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, lte, or, sql, desc } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import { sweepQueue, treasuryWallets, depositAddresses, deposits } from '../../../src/db/schema.ts';
import { activeBlockchainProvider } from '../providers/index.ts';
import { logger } from '../../utils/logger.ts';
import { auditRepository } from '../../repositories/auditRepository.ts';
import { keyManager } from '../keys/KeyManager.ts';
import { treasuryService } from './TreasuryService.ts';

// Gas funding configuration thresholds
export const MIN_GAS_REQUIRED: Record<string, string> = {
  USDT_BEP20: '0.005',     // BNB
  USDT_POLYGON: '0.1',     // MATIC/POL
  USDT_TRC20: '15.0',      // TRX
};

export const GAS_FUND_AMOUNT: Record<string, string> = {
  USDT_BEP20: '0.005',
  USDT_POLYGON: '0.1',
  USDT_TRC20: '20.0',
};

export class SweepQueueProcessor {
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private activeLocks: Set<string> = new Set(); // Prevent concurrent operations on the same address/wallet

  constructor(private readonly provider = activeBlockchainProvider) {}

  /**
   * Start the background sweep queue worker
   */
  public start() {
    if (this.intervalId) return;
    logger.info('[SweepQueueProcessor] Starting background sweep queue processing loop...');
    // Poll every 20 seconds
    this.intervalId = setInterval(() => this.processQueue(), 20000);
  }

  /**
   * Stop the background sweep queue worker
   */
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('[SweepQueueProcessor] Background sweep queue loop stopped.');
    }
  }

  /**
   * Main state-machine processing loop
   */
  public async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find all active queue items that are not finished or cancelled
      const activeItems = await db
        .select()
        .from(sweepQueue)
        .where(
          or(
            eq(sweepQueue.status, 'PENDING'),
            eq(sweepQueue.status, 'WAITING_DELAY'),
            eq(sweepQueue.status, 'WAITING_GAS'),
            eq(sweepQueue.status, 'GAS_FUNDING'),
            eq(sweepQueue.status, 'READY_TO_SWEEP')
          )
        );

      for (const item of activeItems) {
        // Prevent concurrent processing of the same deposit address
        if (this.activeLocks.has(item.depositAddress)) {
          continue;
        }

        this.activeLocks.add(item.depositAddress);
        try {
          await this.processQueueItem(item);
        } catch (err: any) {
          logger.error(`[SweepQueueProcessor] Failed to process queue item ${item.id}:`, err.message);
        } finally {
          this.activeLocks.delete(item.depositAddress);
        }
      }
    } catch (error: any) {
      logger.error('[SweepQueueProcessor] Error in queue processing loop:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item based on its status
   */
  private async processQueueItem(item: any) {
    const treasury = await treasuryService.getOrCreateTreasuryWallet(item.network);

    // Global paused check
    if (treasury.paused) {
      logger.debug(`[SweepQueueProcessor] Sweeps are paused for network ${item.network}. Skipping item ${item.id}`);
      return;
    }

    const mode = treasury.sweepMode || 'AUTOMATIC';
    const amountFloat = parseFloat(item.amount);
    const thresholdFloat = parseFloat(treasury.autoSweepThreshold || '1.00000000');

    // Rule: Deposits below threshold are never automatically funded or swept
    if (amountFloat < thresholdFloat) {
      if (item.status !== 'PENDING') {
        await db
          .update(sweepQueue)
          .set({ status: 'PENDING', gasStatus: 'LOW', updatedAt: new Date() })
          .where(eq(sweepQueue.id, item.id));
      }
      return;
    }

    // Delay evaluation
    const now = new Date();
    if (item.eligibleAt > now) {
      if (item.status !== 'WAITING_DELAY') {
        await db
          .update(sweepQueue)
          .set({ status: 'WAITING_DELAY', updatedAt: new Date() })
          .where(eq(sweepQueue.id, item.id));
      }
      return; // Wait for delay to expire
    }

    // Check Native Gas Balance
    const nativeBalStr = await this.provider.getNativeBalance(item.network, item.depositAddress);
    const nativeBal = parseFloat(nativeBalStr);
    const minGas = parseFloat(MIN_GAS_REQUIRED[item.network] || '0');

    const hasSufficientGas = nativeBal >= minGas;

    // Handle Manual mode
    if (mode === 'MANUAL') {
      const targetStatus = hasSufficientGas ? 'READY_TO_SWEEP' : 'WAITING_GAS';
      const targetGasStatus = hasSufficientGas ? 'OK' : 'LOW';

      if (item.status !== 'PENDING' && item.status !== targetStatus) {
        await db
          .update(sweepQueue)
          .set({
            status: 'PENDING',
            gasStatus: targetGasStatus,
            updatedAt: new Date()
          })
          .where(eq(sweepQueue.id, item.id));
      }
      return; // Do nothing automatically in MANUAL mode
    }

    // State machine logic for AUTOMATIC and HYBRID modes
    switch (item.status) {
      case 'PENDING':
      case 'WAITING_DELAY':
        // Move to gas check state
        if (hasSufficientGas) {
          await this.transitionItem(item.id, 'READY_TO_SWEEP', 'OK');
        } else {
          await this.transitionItem(item.id, 'WAITING_GAS', 'LOW');
        }
        break;

      case 'WAITING_GAS':
        if (hasSufficientGas) {
          await this.transitionItem(item.id, 'READY_TO_SWEEP', 'OK');
        } else {
          // Trigger automated gas funding
          await this.fundGasForQueueItem(item.id, 'SYSTEM');
        }
        break;

      case 'GAS_FUNDING':
        if (hasSufficientGas) {
          await this.transitionItem(item.id, 'READY_TO_SWEEP', 'OK');
        } else {
          // If gas funding was sent but is not yet reflected, we wait
          logger.debug(`[SweepQueueProcessor] Waiting for gas funding to reflect for ${item.depositAddress}. Current: ${nativeBalStr}`);
        }
        break;

      case 'READY_TO_SWEEP':
        if (!hasSufficientGas) {
          await this.transitionItem(item.id, 'WAITING_GAS', 'LOW');
        } else {
          // Trigger automated sweep
          await this.sweepQueueItem(item.id, 'SYSTEM');
        }
        break;

      default:
        break;
    }
  }

  /**
   * Helper to transition queue item states
   */
  private async transitionItem(itemId: string, status: string, gasStatus: string, errorMessage?: string) {
    await db
      .update(sweepQueue)
      .set({
        status,
        gasStatus,
        errorMessage: errorMessage || null,
        updatedAt: new Date()
      })
      .where(eq(sweepQueue.id, itemId));
    logger.info(`[SweepQueueProcessor] Item ${itemId} transitioned to ${status} (Gas: ${gasStatus})`);
  }

  /**
   * Fund gas manually or automatically for a queue item
   */
  public async fundGasForQueueItem(itemId: string, adminUid: string = 'SYSTEM'): Promise<string> {
    const itemRecord = await db
      .select()
      .from(sweepQueue)
      .where(eq(sweepQueue.id, itemId))
      .limit(1);

    if (itemRecord.length === 0) {
      throw new Error(`Sweep queue item not found: ${itemId}`);
    }

    const item = itemRecord[0];
    if (item.status === 'COMPLETED' || item.status === 'CANCELLED') {
      throw new Error(`Cannot fund gas for item in status: ${item.status}`);
    }

    const fundAmount = GAS_FUND_AMOUNT[item.network];
    if (!fundAmount) {
      throw new Error(`Unsupported network for gas funding: ${item.network}`);
    }

    logger.info(`[SweepQueueProcessor] Initiating gas funding of ${fundAmount} for ${item.depositAddress} (${item.network})`);

    // Prevent concurrent duplicate funding
    await db
      .update(sweepQueue)
      .set({
        status: 'GAS_FUNDING',
        gasStatus: 'FUNDING_SENT',
        updatedAt: new Date()
      })
      .where(eq(sweepQueue.id, itemId));

    try {
      const gasTxHash = await this.provider.fundGas(item.network, item.depositAddress, fundAmount);

      await db
        .update(sweepQueue)
        .set({
          gasTxHash,
          updatedAt: new Date()
        })
        .where(eq(sweepQueue.id, itemId));

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: item.userId,
        action: 'TREASURY_GAS_FUNDING_SENT',
        resource: `sweepQueue/${itemId}`,
        oldValue: '0.00000000',
        newValue: JSON.stringify({ amount: fundAmount, txHash: gasTxHash }),
      });

      logger.info(`[SweepQueueProcessor] Gas funding tx broadcasted: ${gasTxHash}`);
      return gasTxHash;
    } catch (err: any) {
      logger.error(`[SweepQueueProcessor] Gas funding FAILED for ${item.depositAddress}:`, err.message);
      
      await db
        .update(sweepQueue)
        .set({
          status: 'WAITING_GAS',
          gasStatus: 'FAILED',
          errorMessage: `Gas funding failed: ${err.message}`,
          updatedAt: new Date()
        })
        .where(eq(sweepQueue.id, itemId));

      throw err;
    }
  }

  /**
   * Sweep a queue item manually or automatically
   */
  public async sweepQueueItem(itemId: string, adminUid: string = 'SYSTEM'): Promise<string> {
    const itemRecord = await db
      .select()
      .from(sweepQueue)
      .where(eq(sweepQueue.id, itemId))
      .limit(1);

    if (itemRecord.length === 0) {
      throw new Error(`Sweep queue item not found: ${itemId}`);
    }

    const item = itemRecord[0];
    if (item.status === 'COMPLETED' || item.status === 'CANCELLED') {
      throw new Error(`Cannot sweep item in status: ${item.status}`);
    }

    logger.info(`[SweepQueueProcessor] Initiating sweep for queue item ${itemId} (${item.amount} USDT)`);

    // Lock the status to SWEEPING to prevent double sweeps
    await db
      .update(sweepQueue)
      .set({
        status: 'SWEEPING',
        updatedAt: new Date()
      })
      .where(eq(sweepQueue.id, itemId));

    try {
      // Look up depositAddress record in db to get its ID
      const addrRec = await db
        .select()
        .from(depositAddresses)
        .where(
          and(
            eq(depositAddresses.address, item.depositAddress),
            eq(depositAddresses.network, item.network)
          )
        )
        .limit(1);

      if (addrRec.length === 0) {
        throw new Error(`Deposit address record not found for address: ${item.depositAddress}`);
      }

      // Execute sweep user-to-hot
      const sweepResult = await treasuryService.sweepUserDepositAddress(addrRec[0].id, adminUid);

      if (sweepResult.success && sweepResult.txHash) {
        // Complete the sweep queue record
        await db
          .update(sweepQueue)
          .set({
            status: 'COMPLETED',
            sweepTxHash: sweepResult.txHash,
            updatedAt: new Date()
          })
          .where(eq(sweepQueue.id, itemId));

        // Subtract the spent gas fee on simulation
        try {
          const spentGas = MIN_GAS_REQUIRED[item.network];
          const newNative = Math.max(0, parseFloat(addrRec[0].nativeBalance || '0') - parseFloat(spentGas)).toFixed(8);
          await db
            .update(depositAddresses)
            .set({
              nativeBalance: newNative,
              updatedAt: new Date(),
            })
            .where(eq(depositAddresses.id, addrRec[0].id));
        } catch (gasErr) {
          // ignore
        }

        logger.info(`[SweepQueueProcessor] Sweep queue item ${itemId} COMPLETED. Tx: ${sweepResult.txHash}`);
        return sweepResult.txHash;
      } else {
        throw new Error(sweepResult.error || 'Unknown sweep error');
      }
    } catch (err: any) {
      logger.error(`[SweepQueueProcessor] Sweep queue item ${itemId} FAILED:`, err.message);

      await db
        .update(sweepQueue)
        .set({
          status: 'FAILED',
          errorMessage: err.message,
          attempts: item.attempts + 1,
          updatedAt: new Date()
        })
        .where(eq(sweepQueue.id, itemId));

      throw err;
    }
  }

  /**
   * Helper to calculate the eligible date based on Delay configuration
   */
  public calculateEligibleAt(createdAt: Date, delayConfig: string, customMinutes: number): Date {
    const date = new Date(createdAt);
    switch (delayConfig) {
      case 'IMMEDIATE':
        return date;
      case '1_HOUR':
        date.setHours(date.getHours() + 1);
        return date;
      case '6_HOURS':
        date.setHours(date.getHours() + 6);
        return date;
      case '24_HOURS':
        date.setDate(date.getDate() + 1);
        return date;
      case '3_DAYS':
        date.setDate(date.getDate() + 3);
        return date;
      case '7_DAYS':
        date.setDate(date.getDate() + 7);
        return date;
      case 'CUSTOM':
        date.setMinutes(date.getMinutes() + customMinutes);
        return date;
      case 'MANUAL_ONLY':
        // Extremely far in the future so auto-sweep never processes it
        date.setFullYear(date.getFullYear() + 100);
        return date;
      default:
        return date;
    }
  }

  /**
   * Register a new deposit in the sweep queue
   */
  public async registerDeposit(depositId: string): Promise<any> {
    const depRecord = await db
      .select()
      .from(deposits)
      .where(eq(deposits.id, depositId))
      .limit(1);

    if (depRecord.length === 0) return null;
    const deposit = depRecord[0];

    // Check if already registered
    const existing = await db
      .select()
      .from(sweepQueue)
      .where(eq(sweepQueue.depositId, depositId))
      .limit(1);

    if (existing.length > 0) return existing[0];

    const treasury = await treasuryService.getOrCreateTreasuryWallet(deposit.network);
    const amountFloat = parseFloat(deposit.amount);
    const thresholdFloat = parseFloat(treasury.autoSweepThreshold || '1.00000000');

    let status = 'PENDING';
    let eligibleAt = new Date();

    if (amountFloat < thresholdFloat) {
      status = 'PENDING'; // Below threshold
    } else {
      const mode = treasury.sweepMode || 'AUTOMATIC';
      if (mode === 'MANUAL') {
        status = 'PENDING';
      } else {
        eligibleAt = this.calculateEligibleAt(new Date(), treasury.sweepDelay || 'IMMEDIATE', treasury.customDelayMinutes || 0);
        if (eligibleAt > new Date()) {
          status = 'WAITING_DELAY';
        } else {
          // Calculate status based on gas check
          const nativeBalStr = await this.provider.getNativeBalance(deposit.network, deposit.depositAddress);
          const nativeBal = parseFloat(nativeBalStr);
          const minGas = parseFloat(MIN_GAS_REQUIRED[deposit.network] || '0');
          status = nativeBal >= minGas ? 'READY_TO_SWEEP' : 'WAITING_GAS';
        }
      }
    }

    const inserted = await db
      .insert(sweepQueue)
      .values({
        depositId: deposit.id,
        userId: deposit.userId,
        depositAddress: deposit.depositAddress,
        network: deposit.network,
        amount: deposit.amount,
        status,
        gasStatus: 'LOW', // will be evaluated on first loop pass
        eligibleAt,
      })
      .returning();

    logger.info(`[SweepQueueProcessor] Registered deposit ${deposit.id} into Sweep Queue in status ${status}`);
    
    // Auto trigger the loop to process immediately if IMMEDIATE
    if (status === 'READY_TO_SWEEP' || status === 'WAITING_GAS') {
      setTimeout(() => this.processQueue(), 100);
    }

    return inserted[0];
  }

  /**
   * Cancel or remove an item from the sweep queue
   */
  public async cancelQueueItem(itemId: string, adminUid: string = 'SYSTEM') {
    await db
      .update(sweepQueue)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date()
      })
      .where(eq(sweepQueue.id, itemId));

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: null as any,
      action: 'TREASURY_SWEEP_CANCELLED',
      resource: `sweepQueue/${itemId}`,
      oldValue: 'ACTIVE',
      newValue: 'CANCELLED',
    });
  }

  /**
   * Bulk Operations
   */
  public async bulkFundGas(itemIds: string[], adminUid: string = 'SYSTEM') {
    const results = [];
    for (const id of itemIds) {
      try {
        const txHash = await this.fundGasForQueueItem(id, adminUid);
        results.push({ id, success: true, txHash });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  public async bulkSweep(itemIds: string[], adminUid: string = 'SYSTEM') {
    const results = [];
    for (const id of itemIds) {
      try {
        const txHash = await this.sweepQueueItem(id, adminUid);
        results.push({ id, success: true, txHash });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  public async bulkFundAndSweep(itemIds: string[], adminUid: string = 'SYSTEM') {
    const results = [];
    for (const id of itemIds) {
      try {
        let txHashGas = '';
        try {
          txHashGas = await this.fundGasForQueueItem(id, adminUid);
        } catch (gasErr) {
          // If already has gas or gas funding is in progress, continue to sweep
        }
        
        // Wait a small bit and then sweep (in simulation this succeeds instantly)
        const txHashSweep = await this.sweepQueueItem(id, adminUid);
        results.push({ id, success: true, gasTxHash: txHashGas, sweepTxHash: txHashSweep });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }
}

export const sweepQueueProcessor = new SweepQueueProcessor();
export default sweepQueueProcessor;
