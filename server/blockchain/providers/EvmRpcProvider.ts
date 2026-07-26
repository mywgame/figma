/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { keyManager } from '../keys/KeyManager.ts';
import { rpcManager } from '../rpc/RpcManager.ts';
import { tokenRegistry } from '../tokens/tokenRegistry.ts';
import type { BlockchainProvider, BlockchainTransaction, DiscoveredTransfer } from '../interfaces/BlockchainProvider.ts';
import { normalizeAmount, denormalizeAmount } from '../utils/amountUtils.ts';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export class EvmRpcProvider implements BlockchainProvider {
  private dynamicChunkSizes: Record<string, number> = {};

  /**
   * Get dynamic block chunk size for a network, starting with configured default
   */
  public getChunkSize(network: string): number {
    if (!this.dynamicChunkSizes[network]) {
      const configVal = blockchainConfig.networks[network]?.blockChunkSize;
      this.dynamicChunkSizes[network] = configVal && configVal > 0 ? configVal : 100;
    }
    return this.dynamicChunkSizes[network];
  }

  private handleChunkSizeError(network: string, err: any) {
    const current = this.getChunkSize(network);
    const msg = (err?.message || '').toLowerCase();
    if (
      msg.includes('limit') ||
      msg.includes('exceeded') ||
      msg.includes('too many') ||
      msg.includes('-32005') ||
      msg.includes('-32000') ||
      msg.includes('timeout')
    ) {
      const minChunk = 10;
      const newChunk = Math.max(minChunk, Math.floor(current / 2));
      if (newChunk !== current) {
        this.dynamicChunkSizes[network] = newChunk;
        rpcManager.logThrottled(
          `chunk_reduce_${network}`,
          'warn',
          `[EvmRpcProvider] RPC log limit hit on ${network}. Reduced dynamic block chunk size to ${newChunk}.`
        );
      }
    }
  }

  private handleChunkSizeSuccess(network: string) {
    const current = this.getChunkSize(network);
    const maxConfig = blockchainConfig.networks[network]?.blockChunkSize || 100;
    if (current < maxConfig) {
      this.dynamicChunkSizes[network] = Math.min(maxConfig, current + 10);
    }
  }

  /**
   * Derive EVM deposit address using KeyManager / HD engine
   */
  async generateDepositAddress(network: string, derivationIndex: number): Promise<string> {
    return keyManager.deriveAddress(network, derivationIndex);
  }

  /**
   * Get ERC20 token balance via JSON-RPC
   */
  async getBalance(network: string, address: string): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    if (!netConfig || !netConfig.contractAddress) return '0.00000000';

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getEthersProvider(network, rpcUrl);
        const contract = new ethers.Contract(netConfig.contractAddress, ERC20_ABI, provider);
        const rawBal: bigint = await contract.balanceOf(address);
        return normalizeAmount(rawBal.toString(), netConfig.decimals);
      });
    } catch (err: any) {
      rpcManager.logThrottled(
        `balance_err_${network}_${address}`,
        'error',
        `[EvmRpcProvider] Failed to get token balance for ${address} on ${network}: ${err.message}`
      );
      return '0.00000000';
    }
  }

  /**
   * Get native network balance (BNB, MATIC/POL, ETH)
   */
  async getNativeBalance(network: string, address: string): Promise<string> {
    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getEthersProvider(network, rpcUrl);
        const rawBal = await provider.getBalance(address);
        return ethers.formatEther(rawBal);
      });
    } catch (err: any) {
      rpcManager.logThrottled(
        `native_bal_err_${network}_${address}`,
        'error',
        `[EvmRpcProvider] Failed to get native balance for ${address} on ${network}: ${err.message}`
      );
      return '0.00000000';
    }
  }

  /**
   * Fund native gas to a deposit address for sweeping
   */
  async fundGas(network: string, toAddress: string, amount: string): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    const hotPrivateKey = netConfig?.hotPrivateKey;

    if (!hotPrivateKey) {
      // Simulation mode fallback
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
      console.log(`[EvmRpcProvider] [SIMULATION] Funded ${amount} gas to ${toAddress} on ${network}. Mock Hash: ${mockTxHash}`);
      return mockTxHash;
    }

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getEthersProvider(network, rpcUrl);
        const wallet = new ethers.Wallet(hotPrivateKey, provider);
        const tx = await wallet.sendTransaction({
          to: toAddress,
          value: ethers.parseEther(amount),
        });
        return tx.hash;
      });
    } catch (err: any) {
      rpcManager.logThrottled(
        `fund_gas_err_${network}`,
        'error',
        `[EvmRpcProvider] Native gas funding failed on ${network} to ${toAddress}: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * Broadcast ERC20 token transfer or native transfer
   */
  async broadcastTransaction(
    network: string,
    toAddress: string,
    amount: string,
    fromPrivateKey?: string
  ): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    const signerKey = fromPrivateKey || netConfig?.hotPrivateKey;

    if (!signerKey) {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
      console.log(`[EvmRpcProvider] [SIMULATION] Broadcasted ${amount} token transfer to ${toAddress} on ${network}. Mock Hash: ${mockTxHash}`);
      return mockTxHash;
    }

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getEthersProvider(network, rpcUrl);
        const wallet = new ethers.Wallet(signerKey, provider);

        if (netConfig?.contractAddress) {
          const contract = new ethers.Contract(netConfig.contractAddress, ERC20_ABI, wallet);
          const parsedAmount = denormalizeAmount(amount, netConfig.decimals);
          const tx = await contract.transfer(toAddress, parsedAmount);
          return tx.hash;
        } else {
          const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.parseEther(amount),
          });
          return tx.hash;
        }
      });
    } catch (err: any) {
      rpcManager.logThrottled(
        `broadcast_err_${network}`,
        'error',
        `[EvmRpcProvider] Broadcast transaction failed on ${network}: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * Validate EVM address
   */
  async validateAddress(_network: string, address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }

  /**
   * Fetch transaction details and verify confirmations
   */
  async getTransaction(network: string, txHash: string): Promise<BlockchainTransaction | null> {
    const netConfig = blockchainConfig.networks[network];
    const decimals = netConfig?.decimals ?? 18;

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getEthersProvider(network, rpcUrl);
        const [tx, receipt, currentBlock] = await Promise.all([
          provider.getTransaction(txHash),
          provider.getTransactionReceipt(txHash),
          provider.getBlockNumber(),
        ]);

        if (!tx || !receipt) return null;

        const isSuccessful = receipt.status === 1;
        const txBlock = receipt.blockNumber || currentBlock;
        const confirmations = Math.max(1, currentBlock - txBlock + 1);

        let amount = '0.00000000';
        let sender = tx.from;
        let receiver = tx.to || '';
        let detectedContract: string | undefined;

        // Interface for parsing ERC20 transfer log
        const iface = new ethers.Interface(ERC20_ABI);
        for (const log of receipt.logs) {
          const matchedToken = tokenRegistry.findTokenByContract(network, log.address);
          if (matchedToken) {
            try {
              const parsedLog = iface.parseLog({ topics: [...log.topics], data: log.data });
              if (parsedLog && parsedLog.name === 'Transfer') {
                sender = parsedLog.args[0];
                receiver = parsedLog.args[1];
                amount = normalizeAmount(parsedLog.args[2].toString(), matchedToken.decimals);
                detectedContract = matchedToken.contractAddress;
                break;
              }
            } catch {
              // Ignore non-standard logs
            }
          }
        }

        if (amount === '0.00000000' && tx.value > 0n) {
          amount = ethers.formatEther(tx.value);
        }

        return {
          hash: txHash,
          amount,
          sender,
          receiver,
          confirmations,
          isSuccessful,
          contractAddress: detectedContract,
        };
      });
    } catch (err: any) {
      rpcManager.logThrottled(
        `get_tx_err_${network}_${txHash}`,
        'error',
        `[EvmRpcProvider] Failed to fetch transaction ${txHash} on ${network}: ${err.message}`
      );
      return null;
    }
  }

  /**
   * Get current block number on EVM chain
   */
  async getCurrentBlockNumber(network: string): Promise<number> {
    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getEthersProvider(network, rpcUrl);
        return await provider.getBlockNumber();
      });
    } catch (err: any) {
      rpcManager.logThrottled(
        `get_block_err_${network}`,
        'error',
        `[EvmRpcProvider] Failed to get current block number for ${network}: ${err.message}`
      );
      return 0;
    }
  }

  /**
   * Scan range of blocks for ERC20 Transfer events
   */
  async getTransferEvents(
    network: string,
    fromBlock: number,
    toBlock: number
  ): Promise<DiscoveredTransfer[]> {
    const activeTokens = tokenRegistry.getTokensForNetwork(network);
    if (!activeTokens || activeTokens.length === 0) return [];
    if (fromBlock > toBlock) return [];

    // Deduplicate contract addresses and normalize before building eth_getLogs filter
    const rawAddresses = activeTokens.map((t) => t.contractAddress);
    const uniqueAddresses = Array.from(new Set(rawAddresses.map((a) => a.toLowerCase()))).map(
      (lower) => rawAddresses.find((a) => a.toLowerCase() === lower) || lower
    );
    const addressFilter = uniqueAddresses.length === 1 ? uniqueAddresses[0] : uniqueAddresses;

    const transferTopic = ethers.id('Transfer(address,address,uint256)');

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getEthersProvider(network, rpcUrl);
        
        try {
          const logs = await provider.getLogs({
            address: addressFilter,
            topics: [transferTopic],
            fromBlock,
            toBlock,
          });

          this.handleChunkSizeSuccess(network);

          const iface = new ethers.Interface(ERC20_ABI);
          const results: DiscoveredTransfer[] = [];

          for (const log of logs) {
            const matchedToken = tokenRegistry.findTokenByContract(network, log.address);
            if (!matchedToken) continue; // Ignore unknown token contracts

            const decimals = matchedToken.decimals;

            try {
              const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
              if (parsed && parsed.name === 'Transfer') {
                const sender = parsed.args[0];
                const receiver = parsed.args[1];
                const rawVal = parsed.args[2].toString();
                const amount = normalizeAmount(rawVal, decimals);

                results.push({
                  txHash: log.transactionHash,
                  amount,
                  sender,
                  receiver,
                  blockNumber: log.blockNumber,
                  network,
                  contractAddress: matchedToken.contractAddress,
                  tokenId: matchedToken.id,
                });
              }
            } catch {
              // Fallback topic extraction if log parse fails
              if (log.topics.length >= 3) {
                const sender = '0x' + log.topics[1].slice(-40);
                const receiver = '0x' + log.topics[2].slice(-40);
                const amount = normalizeAmount(log.data, decimals);
                results.push({
                  txHash: log.transactionHash,
                  amount,
                  sender,
                  receiver,
                  blockNumber: log.blockNumber,
                  network,
                  contractAddress: matchedToken.contractAddress,
                  tokenId: matchedToken.id,
                });
              }
            }
          }

          return results;
        } catch (err: any) {
          this.handleChunkSizeError(network, err);
          throw err;
        }
      });
    } catch (err: any) {
      rpcManager.logThrottled(
        `get_logs_err_${network}`,
        'error',
        `[EvmRpcProvider] Failed to fetch logs for ${network} (${fromBlock}-${toBlock}): ${err.message}`
      );
      return [];
    }
  }
}

export const evmRpcProvider = new EvmRpcProvider();
export default evmRpcProvider;
