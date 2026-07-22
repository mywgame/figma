/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, sql, and, desc } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import { treasuryWallets, treasurySweepJobs, depositAddresses } from '../../../src/db/schema.ts';
import { activeBlockchainProvider } from '../providers/index.ts';
import { logger } from '../../utils/logger.ts';
import { auditRepository } from '../../repositories/auditRepository.ts';
import { keyManager } from '../keys/KeyManager.ts';

export interface TreasuryWalletConfig {
  network: string;
  hotAddress: string;
  coldAddress: string;
  autoSweepEnabled: boolean;
  autoSweepThreshold: string;
}

const DEFAULT_TREASURY_CONFIGS: Record<string, TreasuryWalletConfig> = {
  USDT_BEP20: {
    network: 'USDT_BEP20',
    hotAddress: '0xBE0c8838B296bc8e6307B2D26786a3449339e0E7',
    coldAddress: '0x9Be6F66a87754d924fD08873E47A70176D5Bf92b',
    autoSweepEnabled: true,
    autoSweepThreshold: '50.00000000',
  },
  USDT_POLYGON: {
    network: 'USDT_POLYGON',
    hotAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d1476B',
    coldAddress: '0x89205A0A3b2a2512f410529A98c39e8023e3E01a',
    autoSweepEnabled: true,
    autoSweepThreshold: '50.00000000',
  },
  USDT_TRC20: {
    network: 'USDT_TRC20',
    hotAddress: 'TYb4L7uC16X4G2GvT7vL7f8tYg1fQhZ9uD',
    coldAddress: 'TFA1vL8uX5G3GvA4vM9tX5tEg9fHhK3vL',
    autoSweepEnabled: true,
    autoSweepThreshold: '50.00000000',
  },
};

export class TreasuryService {
  constructor(private readonly provider = activeBlockchainProvider) {}

  /**
   * Seed / retrieve the treasury configuration for a specific network
   */
  async getOrCreateTreasuryWallet(network: string) {
    const cleanNetwork = network.toUpperCase();
    const existing = await db
      .select()
      .from(treasuryWallets)
      .where(eq(treasuryWallets.network, cleanNetwork))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const defaultConfig = DEFAULT_TREASURY_CONFIGS[cleanNetwork];
    if (!defaultConfig) {
      throw new Error(`Unsupported treasury blockchain network: ${network}`);
    }

    logger.info(`[TreasuryService] Seeding default treasury configuration for ${cleanNetwork}...`);
    const inserted = await db
      .insert(treasuryWallets)
      .values({
        network: cleanNetwork,
        hotAddress: defaultConfig.hotAddress,
        coldAddress: defaultConfig.coldAddress,
        autoSweepEnabled: defaultConfig.autoSweepEnabled,
        autoSweepThreshold: defaultConfig.autoSweepThreshold,
        hotBalance: '0.00000000',
        coldBalance: '0.00000000',
      })
      .returning();

    return inserted[0];
  }

  /**
   * Initialize all default treasury wallet configurations if missing
   */
  async ensureAllTreasuryWallets() {
    for (const network of Object.keys(DEFAULT_TREASURY_CONFIGS)) {
      await this.getOrCreateTreasuryWallet(network);
    }
  }

  /**
   * Fetch complete treasury metrics and list of deposit addresses for a network
   */
  async getTreasuryOverview(network: string) {
    const walletConfig = await this.getOrCreateTreasuryWallet(network);
    
    // Fetch user deposit addresses with on-chain balances
    const addresses = await db
      .select()
      .from(depositAddresses)
      .where(eq(depositAddresses.network, network))
      .orderBy(desc(depositAddresses.createdAt));

    // Calculate sum of pending sweep amounts
    let totalPendingSweep = 0;
    addresses.forEach((addr) => {
      totalPendingSweep += parseFloat(addr.onChainBalance);
    });

    // Query active blockchain provider live balances for hot/cold wallets if configured
    let liveHotBalance = walletConfig.hotBalance;
    let liveColdBalance = walletConfig.coldBalance;

    try {
      const liveHot = await this.provider.getBalance(network, walletConfig.hotAddress);
      const liveCold = await this.provider.getBalance(network, walletConfig.coldAddress);
      
      // If we got valid numeric strings back, cache / update them
      if (liveHot !== '0.00000000' || liveCold !== '0.00000000') {
        await db
          .update(treasuryWallets)
          .set({
            hotBalance: liveHot,
            coldBalance: liveCold,
            updatedAt: new Date(),
          })
          .where(eq(treasuryWallets.network, network));
        
        liveHotBalance = liveHot;
        liveColdBalance = liveCold;
      }
    } catch (err: any) {
      logger.warn(`[TreasuryService] Failed to fetch on-chain live hot/cold balances for ${network}: ${err.message}`);
    }

    return {
      config: walletConfig,
      totalPendingSweep: totalPendingSweep.toFixed(8),
      liveHotBalance,
      liveColdBalance,
      depositAddresses: addresses,
    };
  }

  /**
   * Sweep funds from a specific user deposit address to the Hot Wallet (USER_TO_HOT)
   */
  async sweepUserDepositAddress(addressId: string, adminUid: string = 'SYSTEM') {
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
    const treasury = await this.getOrCreateTreasuryWallet(addr.network);

    logger.info(`[TreasuryService] Commencing sweep for address ${addr.address} (${amountStr} USDT) to Hot Wallet ${treasury.hotAddress}`);

    // Create a sweep job in database
    const job = await db
      .insert(treasurySweepJobs)
      .values({
        network: addr.network,
        sourceAddress: addr.address,
        destinationAddress: treasury.hotAddress,
        sweepType: 'USER_TO_HOT',
        amount: amountStr,
        status: 'PENDING',
        attempts: 1,
      })
      .returning();

    const jobId = job[0].id;

    try {
      // Set status to IN_PROGRESS
      await db
        .update(treasurySweepJobs)
        .set({ status: 'IN_PROGRESS', updatedAt: new Date() })
        .where(eq(treasurySweepJobs.id, jobId));

      if (addr.derivationIndex === null || addr.derivationIndex === undefined) {
        throw new Error(`Deposit address ${addr.address} does not have a derivation index assigned.`);
      }

      // Derive the user's child private key to sign the transaction
      const childPrivateKey = await keyManager.derivePrivateKey(addr.network, addr.derivationIndex);

      // Broadcast on-chain transaction signed by the user's child private key
      const txHash = await this.provider.broadcastTransaction(
        addr.network,
        treasury.hotAddress,
        amountStr,
        childPrivateKey
      );

      // Successfully processed on-chain!
      // Update database status and modify balances atomically
      await db.transaction(async (tx) => {
        // Complete the sweep job
        await tx
          .update(treasurySweepJobs)
          .set({
            status: 'COMPLETED',
            txHash,
            updatedAt: new Date(),
          })
          .where(eq(treasurySweepJobs.id, jobId));

        // Deduct from deposit address on-chain balance
        await tx
          .update(depositAddresses)
          .set({
            onChainBalance: '0.00000000',
            updatedAt: new Date(),
          })
          .where(eq(depositAddresses.id, addressId));

        // Add to treasury hot wallet balance
        const currentHotFloat = parseFloat(treasury.hotBalance);
        const newHotStr = (currentHotFloat + amountFloat).toFixed(8);
        await tx
          .update(treasuryWallets)
          .set({
            hotBalance: newHotStr,
            updatedAt: new Date(),
          })
          .where(eq(treasuryWallets.network, addr.network));
      });

      logger.info(`[TreasuryService] Sweep COMPLETED for address ${addr.address}. TxHash: ${txHash}`);

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: addr.userId,
        action: 'TREASURY_SWEEP_USER_TO_HOT',
        resource: `treasury/jobs/${jobId}`,
        oldValue: amountStr,
        newValue: txHash,
      });

      return { success: true, jobId, txHash };
    } catch (err: any) {
      logger.error(`[TreasuryService] Sweep FAILED for address ${addr.address}:`, err.message);

      await db
        .update(treasurySweepJobs)
        .set({
          status: 'FAILED',
          errorMessage: err.message,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      return { success: false, jobId, error: err.message };
    }
  }

  /**
   * Sweep ALL eligible deposit addresses on a selected network
   */
  async sweepAllEligibleAddresses(network: string, adminUid: string = 'SYSTEM') {
    const cleanNetwork = network.toUpperCase();
    const addresses = await db
      .select()
      .from(depositAddresses)
      .where(
        and(
          eq(depositAddresses.network, cleanNetwork),
          sql`CAST(${depositAddresses.onChainBalance} AS DECIMAL) > 0`
        )
      );

    logger.info(`[TreasuryService] Found ${addresses.length} eligible addresses with positive balance for ${cleanNetwork}`);

    const results = [];
    for (const addr of addresses) {
      const res = await this.sweepUserDepositAddress(addr.id, adminUid);
      results.push({ address: addr.address, ...res });
    }

    return results;
  }

  /**
   * Transfer funds from Hot Wallet to Cold Wallet (HOT_TO_COLD)
   */
  async sweepHotToCold(network: string, amount: string, adminUid: string = 'SYSTEM') {
    const cleanNetwork = network.toUpperCase();
    const treasury = await this.getOrCreateTreasuryWallet(cleanNetwork);

    const amountFloat = parseFloat(amount);
    if (amountFloat <= 0) {
      throw new Error('Transfer amount to cold wallet must be strictly positive.');
    }

    const currentHotFloat = parseFloat(treasury.hotBalance);
    if (currentHotFloat < amountFloat) {
      throw new Error(`Insufficient Hot Wallet balance. Available: ${treasury.hotBalance} USDT, Requested: ${amount} USDT`);
    }

    logger.info(`[TreasuryService] Commencing sweep from Hot Wallet (${treasury.hotAddress}) to Cold Wallet (${treasury.coldAddress}) of ${amount} USDT`);

    // Create a sweep job in database
    const job = await db
      .insert(treasurySweepJobs)
      .values({
        network: cleanNetwork,
        sourceAddress: treasury.hotAddress,
        destinationAddress: treasury.coldAddress,
        sweepType: 'HOT_TO_COLD',
        amount,
        status: 'PENDING',
        attempts: 1,
      })
      .returning();

    const jobId = job[0].id;

    try {
      // Set status to IN_PROGRESS
      await db
        .update(treasurySweepJobs)
        .set({ status: 'IN_PROGRESS', updatedAt: new Date() })
        .where(eq(treasurySweepJobs.id, jobId));

      // Broadcast on-chain transaction
      const txHash = await this.provider.broadcastTransaction(cleanNetwork, treasury.coldAddress, amount);

      // Transaction successfully broadcast on-chain!
      await db.transaction(async (tx) => {
        // Complete the sweep job
        await tx
          .update(treasurySweepJobs)
          .set({
            status: 'COMPLETED',
            txHash,
            updatedAt: new Date(),
          })
          .where(eq(treasurySweepJobs.id, jobId));

        // Deduct from hotBalance, increment coldBalance
        const newHotStr = (currentHotFloat - amountFloat).toFixed(8);
        const currentColdFloat = parseFloat(treasury.coldBalance);
        const newColdStr = (currentColdFloat + amountFloat).toFixed(8);

        await tx
          .update(treasuryWallets)
          .set({
            hotBalance: newHotStr,
            coldBalance: newColdStr,
            updatedAt: new Date(),
          })
          .where(eq(treasuryWallets.network, cleanNetwork));
      });

      logger.info(`[TreasuryService] Hot to Cold Sweep COMPLETED. TxHash: ${txHash}`);

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: null as any, // Not bound to any specific user
        action: 'TREASURY_SWEEP_HOT_TO_COLD',
        resource: `treasury/jobs/${jobId}`,
        oldValue: amount,
        newValue: txHash,
      });

      return { success: true, jobId, txHash };
    } catch (err: any) {
      logger.error(`[TreasuryService] Hot to Cold Sweep FAILED:`, err.message);

      await db
        .update(treasurySweepJobs)
        .set({
          status: 'FAILED',
          errorMessage: err.message,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      return { success: false, jobId, error: err.message };
    }
  }

  /**
   * Retry a failed sweep job
   */
  async retrySweepJob(jobId: string, adminUid: string = 'SYSTEM') {
    const jobRecord = await db
      .select()
      .from(treasurySweepJobs)
      .where(eq(treasurySweepJobs.id, jobId))
      .limit(1);

    if (jobRecord.length === 0) {
      throw new Error(`Sweep job record not found: ${jobId}`);
    }

    const job = jobRecord[0];
    if (job.status !== 'FAILED') {
      throw new Error(`Only failed sweep jobs can be retried. Current status is: ${job.status}`);
    }

    logger.info(`[TreasuryService] Retrying failed sweep job ${jobId} of ${job.amount} USDT on ${job.network}`);

    // Update attempts count
    await db
      .update(treasurySweepJobs)
      .set({
        attempts: job.attempts + 1,
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      })
      .where(eq(treasurySweepJobs.id, jobId));

    try {
      // Broadcast on-chain transaction
      const txHash = await this.provider.broadcastTransaction(job.network, job.destinationAddress, job.amount);

      // Perform state/balance updates based on job type
      await db.transaction(async (tx) => {
        // Complete the sweep job
        await tx
          .update(treasurySweepJobs)
          .set({
            status: 'COMPLETED',
            txHash,
            updatedAt: new Date(),
          })
          .where(eq(treasurySweepJobs.id, jobId));

        const amountFloat = parseFloat(job.amount);
        const treasury = await this.getOrCreateTreasuryWallet(job.network);

        if (job.sweepType === 'USER_TO_HOT') {
          // Decrement user deposit address on-chain balance (find by address & network)
          const addrRecord = await tx
            .select()
            .from(depositAddresses)
            .where(
              and(
                eq(depositAddresses.address, job.sourceAddress),
                eq(depositAddresses.network, job.network)
              )
            )
            .limit(1);

          if (addrRecord.length > 0) {
            await tx
              .update(depositAddresses)
              .set({
                onChainBalance: '0.00000000',
                updatedAt: new Date(),
              })
              .where(eq(depositAddresses.id, addrRecord[0].id));
          }

          // Add to hot balance
          const newHotStr = (parseFloat(treasury.hotBalance) + amountFloat).toFixed(8);
          await tx
            .update(treasuryWallets)
            .set({
              hotBalance: newHotStr,
              updatedAt: new Date(),
            })
            .where(eq(treasuryWallets.network, job.network));

        } else if (job.sweepType === 'HOT_TO_COLD') {
          // Deduct from hot wallet, add to cold wallet
          const newHotStr = (parseFloat(treasury.hotBalance) - amountFloat).toFixed(8);
          const newColdStr = (parseFloat(treasury.coldBalance) + amountFloat).toFixed(8);

          await tx
            .update(treasuryWallets)
            .set({
              hotBalance: newHotStr,
              coldBalance: newColdStr,
              updatedAt: new Date(),
            })
            .where(eq(treasuryWallets.network, job.network));
        }
      });

      logger.info(`[TreasuryService] Retry for job ${jobId} completed successfully! TxHash: ${txHash}`);

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: null as any,
        action: 'TREASURY_SWEEP_RETRY_SUCCESS',
        resource: `treasury/jobs/${jobId}`,
        oldValue: job.attempts.toString(),
        newValue: txHash,
      });

      return { success: true, txHash };
    } catch (err: any) {
      logger.error(`[TreasuryService] Retry for job ${jobId} failed:`, err.message);

      await db
        .update(treasurySweepJobs)
        .set({
          status: 'FAILED',
          errorMessage: err.message,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      return { success: false, error: err.message };
    }
  }

  /**
   * Trigger threshold check on a specific deposit address. If conditions are met, sweep automatically.
   */
  async checkAndTriggerAutoSweep(addressId: string) {
    try {
      const addressRecord = await db
        .select()
        .from(depositAddresses)
        .where(eq(depositAddresses.id, addressId))
        .limit(1);

      if (addressRecord.length === 0) return;

      const addr = addressRecord[0];
      const treasury = await this.getOrCreateTreasuryWallet(addr.network);

      if (!treasury.autoSweepEnabled) {
        logger.debug(`[TreasuryService] Auto-sweep is disabled for network ${addr.network}`);
        return;
      }

      const balanceFloat = parseFloat(addr.onChainBalance);
      const thresholdFloat = parseFloat(treasury.autoSweepThreshold);

      if (balanceFloat >= thresholdFloat) {
        logger.info(`[TreasuryService] Auto-sweep triggered! Address ${addr.address} balance ${balanceFloat} USDT >= threshold ${thresholdFloat} USDT`);
        await this.sweepUserDepositAddress(addr.id, 'SYSTEM');
      }
    } catch (err: any) {
      logger.error(`[TreasuryService] Failed to check / trigger auto-sweep for address ${addressId}:`, err.message);
    }
  }

  /**
   * Update auto-sweep configurations for a network
   */
  async updateAutoSweepConfig(network: string, enabled: boolean, threshold: string, adminUid: string = 'SYSTEM') {
    const cleanNetwork = network.toUpperCase();
    await this.getOrCreateTreasuryWallet(cleanNetwork);

    const updated = await db
      .update(treasuryWallets)
      .set({
        autoSweepEnabled: enabled,
        autoSweepThreshold: threshold,
        updatedAt: new Date(),
      })
      .where(eq(treasuryWallets.network, cleanNetwork))
      .returning();

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: null as any,
      action: 'TREASURY_AUTO_SWEEP_CONFIG_UPDATE',
      resource: `treasury/config/${cleanNetwork}`,
      oldValue: JSON.stringify({ enabled: !enabled }),
      newValue: JSON.stringify({ enabled, threshold }),
    });

    return updated[0];
  }

  /**
   * Get list of all sweep jobs
   */
  async getSweepJobs(network?: string) {
    const query = db.select().from(treasurySweepJobs);
    
    if (network) {
      const cleanNetwork = network.toUpperCase();
      return query.where(eq(treasurySweepJobs.network, cleanNetwork)).orderBy(desc(treasurySweepJobs.createdAt));
    }
    
    return query.orderBy(desc(treasurySweepJobs.createdAt));
  }
}

export const treasuryService = new TreasuryService();
export default treasuryService;
