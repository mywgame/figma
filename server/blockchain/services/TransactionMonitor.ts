/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { depositRepository } from '../../repositories/depositRepository.ts';
import { depositAddressRepository } from '../../repositories/depositAddressRepository.ts';
import { settingsRepository } from '../../repositories/settingsRepository.ts';
import { depositService } from './DepositService.ts';
import { notificationService } from '../../services/notificationService.ts';
import { logger } from '../../utils/logger.ts';
import { rpcManager } from '../rpc/RpcManager.ts';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { tokenRegistry } from '../tokens/tokenRegistry.ts';
import { BlockchainProvider, DiscoveredTransfer } from '../interfaces/BlockchainProvider.ts';
import { activeBlockchainProvider } from '../providers/index.ts';

export class TransactionMonitor {
  private timer: NodeJS.Timeout | null = null;
  private isChecking = false;
  
  // Track consecutive non-existence of transaction hash on-chain to save API credits
  private queryAttempts: Record<string, number> = {};
  
  // Track network failure counts and cooldown timestamps
  private networkFailures: Record<string, { count: number; cooldownUntil: number }> = {};
  
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
   * Scan database for pending deposits and scan blockchain blocks for new deposits
   */
  async checkPendingDeposits() {
    if (this.isChecking) {
      logger.debug('Previous transaction check is still executing. Skipping this tick.');
      return;
    }

    this.isChecking = true;
    try {
      // 1. Scan new blocks across supported networks to discover incoming deposits
      await this.scanNewBlocks();

      // 2. Find all deposits that are PENDING to check on-chain status
      const pendingDeposits = await depositRepository.findAll({ status: 'PENDING' });
      
      // Filter those with txHash
      const withTxHash = pendingDeposits.filter((d) => !!d.txHash);

      // Prune queryAttempts keys for deposit IDs that are no longer pending
      const activeDepositIds = new Set(withTxHash.map((d) => d.id));
      for (const id of Object.keys(this.queryAttempts)) {
        if (!activeDepositIds.has(id)) {
          delete this.queryAttempts[id];
        }
      }

      if (withTxHash.length === 0) {
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

          // Verify token contract if transaction is a token transfer
          if (blockchainTx.contractAddress && !tokenRegistry.isSupportedContract(deposit.network, blockchainTx.contractAddress)) {
            logger.warn(`Deposit ${depositId} (hash: ${txHash}) belongs to an unsupported token contract ${blockchainTx.contractAddress}. Marking deposit as FAILED.`);
            await depositRepository.updateStatus(depositId, 'FAILED', {
              adminNotes: `Invalid or untrusted token contract ${blockchainTx.contractAddress}. Only registered token contracts are accepted.`,
            });
            delete this.queryAttempts[depositId];
            continue;
          }

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

  /**
   * Scan blockchain blocks across all supported networks to automatically detect
   * incoming deposits to user deposit addresses.
   */
  async scanNewBlocks() {
    if (!this.provider.getCurrentBlockNumber || !this.provider.getTransferEvents) {
      return;
    }

    const networks = Object.keys(blockchainConfig.networks);

    for (const network of networks) {
      const failureState = this.networkFailures[network] || { count: 0, cooldownUntil: 0 };
      if (Date.now() < failureState.cooldownUntil) {
        // Skip scanning while in cooldown
        continue;
      }

      try {
        const currentBlock = await this.provider.getCurrentBlockNumber(network);
        if (!currentBlock || currentBlock <= 0) continue;

        // Reset failure tracking on success
        if (this.networkFailures[network]?.count > 0) {
          logger.info(`[TransactionMonitor] Network ${network} scanning recovered.`);
          this.networkFailures[network] = { count: 0, cooldownUntil: 0 };
        }

        // Confirmation depth buffer (e.g. 3 blocks) to avoid top block reorgs
        const confirmationDepth = 3;
        const targetBlock = Math.max(0, currentBlock - confirmationDepth);

        const settingKey = `LAST_SCANNED_BLOCK_${network}`;
        const setting = await settingsRepository.findSystemSettingByKey(settingKey);

        let fromBlock: number;
        if (setting && setting.value) {
          fromBlock = parseInt(setting.value, 10) + 1;
        } else {
          // On initial start, scan the most recent 50 blocks
          fromBlock = Math.max(0, targetBlock - 50);
        }

        if (fromBlock > targetBlock) {
          continue; // Already scanned up to target block
        }

        // Determine dynamic block chunk size based on provider capabilities or config default
        let chunkSize = blockchainConfig.networks[network]?.blockChunkSize || 100;
        if (typeof (this.provider as any).getChunkSize === 'function') {
          chunkSize = (this.provider as any).getChunkSize(network);
        }
        const toBlock = Math.min(targetBlock, fromBlock + chunkSize - 1);

        rpcManager.logThrottled(
          `tm_scan_${network}`,
          'info',
          `[TransactionMonitor] Scanning ${network} blocks ${fromBlock} to ${toBlock} (Tip: ${currentBlock}, Chunk: ${chunkSize})...`
        );

        const transfers = await this.provider.getTransferEvents(network, fromBlock, toBlock);

        for (const transfer of transfers) {
          await this.processDiscoveredTransfer(transfer);
        }

        // Persist updated last scanned block number in database
        await settingsRepository.setSystemSetting(
          settingKey,
          toBlock.toString(),
          'SYSTEM',
          `Last scanned block for ${network}`
        );
      } catch (err: any) {
        const count = (failureState.count || 0) + 1;
        const cooldownMs = Math.min(300000, Math.pow(2, Math.min(count, 5)) * 15000); // 30s, 60s, 120s, up to 5 mins
        this.networkFailures[network] = { count, cooldownUntil: Date.now() + cooldownMs };

        rpcManager.logThrottled(
          `tm_scan_err_${network}`,
          'warn',
          `[TransactionMonitor] Block scanning error for ${network} (Failure #${count}, cooling down for ${Math.round(cooldownMs / 1000)}s): ${err.message || err}`,
          120000
        );
      }
    }
  }

  /**
   * Process an on-chain transfer discovered during block scanning
   */
  async processDiscoveredTransfer(transfer: DiscoveredTransfer) {
    try {
      const { txHash, amount, receiver, network, contractAddress } = transfer;
      if (!receiver || !txHash) return;

      // Verify contract address is registered in tokenRegistry
      if (contractAddress && !tokenRegistry.isSupportedContract(network, contractAddress)) {
        logger.warn(`[TransactionMonitor] Discovered transfer on ${network} for unsupported token contract ${contractAddress}. Ignoring.`);
        return;
      }

      // Look up if recipient address belongs to a user
      const depositAddr = await depositAddressRepository.findByAddress(receiver);
      if (!depositAddr) {
        return; // Transfer was to an unknown address on-chain
      }

      logger.info(`[TransactionMonitor] On-chain deposit detected! User: ${depositAddr.userId}, Address: ${receiver}, Network: ${network}, Amount: ${amount} USDT, TxHash: ${txHash}`);

      // Check if a deposit record already exists for this txHash
      const existingDeposit = await depositRepository.findByTxHash(txHash);

      if (existingDeposit) {
        if (existingDeposit.status === 'PENDING') {
          logger.info(`[TransactionMonitor] Found existing pending deposit ${existingDeposit.id} for txHash ${txHash}. Processing completion.`);
          await depositService.processSuccessfulDeposit(existingDeposit.id, txHash, 'SYSTEM');
        } else {
          logger.debug(`[TransactionMonitor] Deposit ${existingDeposit.id} for txHash ${txHash} already has status ${existingDeposit.status}. Skipping.`);
        }
        return;
      }

      // Create new deposit record automatically
      const newDeposit = await depositService.createDeposit(
        depositAddr.userId,
        amount,
        depositAddr.network || network,
        depositAddr.address,
        txHash
      );

      // Process deposit, credit user balance, and register in sweep queue
      await depositService.processSuccessfulDeposit(newDeposit.id, txHash, 'SYSTEM');
      logger.info(`[TransactionMonitor] Auto-deposit ${newDeposit.id} processed & credited successfully for user ${depositAddr.userId}.`);

    } catch (err: any) {
      logger.error(`[TransactionMonitor] Error processing discovered transfer ${transfer.txHash}:`, err.message || err);
    }
  }
}

export const transactionMonitor = new TransactionMonitor();
export default transactionMonitor;
