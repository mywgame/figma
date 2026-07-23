/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { depositAddressRepository } from '../../repositories/depositAddressRepository.ts';
import { depositRepository } from '../../repositories/depositRepository.ts';
import { depositService } from '../services/DepositService.ts';
import { logger } from '../../utils/logger.ts';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { normalizeAmount } from '../utils/amountUtils.ts';

export interface TatumWebhookPayload {
  address: string;
  txId: string;
  chain: string;
  amount: string;
  asset: string;
  type: string; // 'deposit' or 'withdrawal'
  contractAddress?: string;
  tokenAddress?: string;
}

export class TatumWebhookHandler {
  /**
   * Process an incoming Tatum transaction webhook payload
   */
  async handleIncomingNotification(payload: TatumWebhookPayload) {
    logger.info(`[TatumWebhookHandler] Received webhook notification: ${JSON.stringify(payload)}`);

    const { address, txId, amount, asset, chain } = payload;

    // Verify it is a USDT transaction
    if (asset && asset.toUpperCase() !== 'USDT') {
      logger.info(`[TatumWebhookHandler] Ignoring non-USDT webhook asset: ${asset}`);
      return { status: 'ignored', reason: 'non_usdt_asset' };
    }

    // 1. Resolve watched address back to our user
    const addressRecord = await depositAddressRepository.findByAddress(address);
    if (!addressRecord) {
      logger.warn(`[TatumWebhookHandler] Webhook address ${address} does not map to any system user. Ignoring.`);
      return { status: 'ignored', reason: 'address_not_found' };
    }

    const userId = addressRecord.userId;
    const network = addressRecord.network; // USDT_BEP20, USDT_POLYGON, USDT_TRC20

    // 2. Validate token contract address immediately against official expected address
    const networkConfig = blockchainConfig.networks[network];
    const expectedContractAddress = networkConfig?.contractAddress;
    const incomingContractAddress = payload.contractAddress || payload.tokenAddress || (payload as any).contract;

    if (!networkConfig || !expectedContractAddress) {
      logger.warn(
        `[TatumWebhookHandler] SECURITY REJECTION: Missing network configuration for network=${network}. ` +
        `txHash=${txId}, network=${network}, incomingContractAddress=${incomingContractAddress || 'MISSING'}, ` +
        `expectedContractAddress=NONE, depositAddress=${address}`
      );
      return { status: 'rejected', reason: 'missing_network_config' };
    }

    if (!incomingContractAddress) {
      logger.warn(
        `[TatumWebhookHandler] SECURITY REJECTION: Missing contract address in webhook payload. ` +
        `txHash=${txId}, network=${network}, incomingContractAddress=MISSING, ` +
        `expectedContractAddress=${expectedContractAddress}, depositAddress=${address}`
      );
      return { status: 'rejected', reason: 'missing_contract_address' };
    }

    const isTron = network === 'USDT_TRC20';
    const isContractValid = isTron
      ? incomingContractAddress === expectedContractAddress
      : incomingContractAddress.toLowerCase() === expectedContractAddress.toLowerCase();

    if (!isContractValid) {
      logger.warn(
        `[TatumWebhookHandler] SECURITY REJECTION: Fake or mismatched token contract address detected! ` +
        `txHash=${txId}, network=${network}, incomingContractAddress=${incomingContractAddress}, ` +
        `expectedContractAddress=${expectedContractAddress}, depositAddress=${address}`
      );
      return { status: 'rejected', reason: 'contract_address_mismatch' };
    }

    // 3. Check if this txHash is already recorded or processed
    const existingDeposit = await depositRepository.findByTxHash(txId);
    if (existingDeposit) {
      if (existingDeposit.status === 'COMPLETED') {
        logger.info(`[TatumWebhookHandler] Webhook tx ${txId} was already successfully processed. Skipping.`);
        return { status: 'processed_already', depositId: existingDeposit.id };
      }

      // If it exists but is PENDING, trigger immediate successful processing!
      logger.info(`[TatumWebhookHandler] Webhook tx ${txId} exists as pending. Completing now.`);
      await depositService.processSuccessfulDeposit(existingDeposit.id, txId, 'SYSTEM');
      return { status: 'completed', depositId: existingDeposit.id };
    }

    // 4. Create a new deposit record and complete it immediately as it is a real webhook event
    const networkDecimals = networkConfig?.decimals ?? (network === 'USDT_BEP20' ? 18 : 6);
    const normalizedAmount = normalizeAmount(amount, networkDecimals);
    logger.info(`[TatumWebhookHandler] Generating new deposit record for user ${userId} of ${normalizedAmount} USDT via webhook.`);
    const newDeposit = await depositService.createDeposit(userId, normalizedAmount, network, address, txId);
    await depositService.processSuccessfulDeposit(newDeposit.id, txId, 'SYSTEM');

    return { status: 'created_and_completed', depositId: newDeposit.id };
  }
}

export const tatumWebhookHandler = new TatumWebhookHandler();
export default tatumWebhookHandler;
