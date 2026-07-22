/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { depositRepository } from '../../repositories/depositRepository.ts';
import { depositService } from './DepositService.ts';
import { notificationService } from '../../services/notificationService.ts';
import { logger } from '../../utils/logger.ts';
import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';

export class TransactionMonitor {
  private timer: NodeJS.Timeout | null = null;
  private isChecking = false;
  
  // Track consecutive non-existence of transaction hash on-chain to save API credits
  private queryAttempts: Record<string, number> = {};
  
  // Max times we poll Tatum for a txHash before assuming it's an invalid or fake hash
  private readonly MAX_ATTEMPTS = 30; // 30 checks * 30s interval = 15 minutes
  private readonly CONFIRMATIONS_REQUIRED = 6; // Required on-chain confirmations

  constructor(private readonly provider: BlockchainProvider = activeBlockchainProvider) {}

  /**
   * Start background transaction monitor loop
   */
  start(intervalMs = 30000) {
    if (this.timer) {
      logger.info('Transaction monitor is already running.');
      return;
    }
    
    logger.info(`Starting background transaction monitoring loop (Interval: ${intervalMs}ms)...`);
    this.timer = setInterval(() => this.checkPendingDeposits(), intervalMs);
    
    // Execute first check immediately on boot
    this.checkPendingDeposits().catch((err) => {
      logger.error('Error in initial transaction monitoring check:', err);
    });
  }

  /**
   * Stop background transaction monitor loop
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Transaction monitor loop stopped.');
    }
  }

  /**
   * Scan database for pending deposits with txHash and verify on-chain
   */
  async checkPendingDeposits() {
    if (this.isChecking) {
      logger.debug('Previous transaction check is still executing. Skipping this tick.');
      return;
    }

    this.isChecking = true;
    try {
      // Find all deposits that are PENDING
      const pendingDeposits = await depositRepository.findAll({ status: 'PENDING' });
      
      // Filter those with txHash
      const withTxHash = pendingDeposits.filter((d) => !!d.txHash);
      if (withTxHash.length === 0) {
        this.isChecking = false;
        return;
      }

      logger.debug(`Polling on-chain status for ${withTxHash.length} pending deposits...`);

      for (const deposit of withTxHash) {
        const txHash = deposit.txHash!;
        const depositId = deposit.id;

        try {
          const blockchainTx = await this.provider.getTransaction(deposit.network, txHash);

          if (!blockchainTx) {
            // Transaction hash not found on-chain yet
            const attempts = (this.queryAttempts[depositId] || 0) + 1;
            this.queryAttempts[depositId] = attempts;

            if (attempts >= this.MAX_ATTEMPTS) {
              logger.warn(`Deposit ${depositId} with hash ${txHash} has timed out on-chain after ${attempts} attempts. Marking as FAILED.`);
              
              // Prevent replay/infinite polling by marking status as FAILED
              await depositRepository.updateStatus(depositId, 'FAILED', {
                adminNotes: `On-chain monitoring timeout: Transaction hash was not detected within ${this.MAX_ATTEMPTS} poll intervals.`,
              });

              // Send failure notification to user
              await notificationService.createStructuredNotification(deposit.userId, {
                title: 'Deposit Verification Failed',
                description: `Verification for your deposit of ${deposit.amount} USDT timed out. Please verify your transaction hash or submit a support ticket.`,
                icon: 'XCircle',
                type: 'deposit',
                priority: 'HIGH',
              });

              delete this.queryAttempts[depositId];
            } else {
              logger.debug(`Tx ${txHash} not yet found on-chain. Attempt ${attempts}/${this.MAX_ATTEMPTS}`);
            }
            continue;
          }

          // Transaction found on-chain! Reset attempts counter
          this.queryAttempts[depositId] = 0;

          if (!blockchainTx.isSuccessful) {
            logger.warn(`Transaction hash ${txHash} is marked as FAILED on-chain. Updating deposit record.`);
            
            await depositRepository.updateStatus(depositId, 'FAILED', {
              adminNotes: 'Transaction was marked as FAILED by the on-chain network explorers.',
            });

            await notificationService.createStructuredNotification(deposit.userId, {
              title: 'Deposit Failed on Blockchain',
              description: `Your transaction of ${deposit.amount} USDT on ${deposit.network} was marked as failed on-chain.`,
              icon: 'XCircle',
              type: 'deposit',
              priority: 'HIGH',
            });

            delete this.queryAttempts[depositId];
            continue;
          }

          // Transaction is successful! Check confirmations
          const confirmations = blockchainTx.confirmations;
          if (confirmations >= this.CONFIRMATIONS_REQUIRED) {
            logger.info(`Deposit ${depositId} (hash: ${txHash}) reached ${confirmations}/${this.CONFIRMATIONS_REQUIRED} confirmations. Crediting user account.`);
            
            // Atomically process successful deposit & credit balances inside a transactional database workflow
            await depositService.processSuccessfulDeposit(depositId, txHash, 'SYSTEM');
            
            delete this.queryAttempts[depositId];
          } else {
            logger.info(`Deposit ${depositId} (hash: ${txHash}) found on-chain with ${confirmations}/${this.CONFIRMATIONS_REQUIRED} confirmations. Awaiting additional blocks...`);
          }

        } catch (error) {
          logger.error(`Error processing transaction monitoring check for deposit ID ${depositId} (hash: ${txHash}):`, error);
        }
      }

    } catch (err) {
      logger.error('Fatal error encountered in background transaction monitoring workflow:', err);
    } finally {
      this.isChecking = false;
    }
  }
}

export const transactionMonitor = new TransactionMonitor();
export default transactionMonitor;
