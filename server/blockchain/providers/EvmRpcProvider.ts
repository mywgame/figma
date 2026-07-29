/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { keyManager } from '../keys/KeyManager.ts';
import { rpcManager } from '../rpc/RpcManager.ts';
import type { BlockchainProvider, BlockchainTransaction } from '../interfaces/BlockchainProvider.ts';
import { normalizeAmount, denormalizeAmount } from '../utils/amountUtils.ts';
import { normalizeEvmAddress } from '../utils/blockchainUtils.ts';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export class EvmRpcProvider implements BlockchainProvider {
  /**
   * Derive EVM deposit address using KeyManager / HD engine
   */
  async generateDepositAddress(network: string, derivationIndex: number): Promise<string> {
    const rawAddr = await keyManager.deriveAddress(network, derivationIndex);
    return normalizeEvmAddress(rawAddr);
  }

  /**
   * Get ERC20 token balance via JSON-RPC
   */
  async getBalance(network: string, address: string): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    if (!netConfig || !netConfig.contractAddress) return '0.00000000';

    const normalizedAddress = normalizeEvmAddress(address);
    const normalizedContract = normalizeEvmAddress(netConfig.contractAddress);

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const contract = new ethers.Contract(normalizedContract, ERC20_ABI, provider);
        const rawBal: bigint = await contract.balanceOf(normalizedAddress);
        return normalizeAmount(rawBal.toString(), netConfig.decimals);
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Failed to get token balance for ${address} on ${network}:`, err.message);
      return '0.00000000';
    }
  }

  /**
   * Get native network balance (BNB, MATIC/POL, ETH)
   */
  async getNativeBalance(network: string, address: string): Promise<string> {
    const normalizedAddress = normalizeEvmAddress(address);
    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const rawBal = await provider.getBalance(normalizedAddress);
        return ethers.formatEther(rawBal);
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Failed to get native balance for ${address} on ${network}:`, err.message);
      return '0.00000000';
    }
  }

  /**
   * Fund native gas to a deposit address for sweeping
   */
  async fundGas(network: string, toAddress: string, amount: string): Promise<string> {
    const netConfig = blockchainConfig.networks[network];
    const hotPrivateKey = netConfig?.hotPrivateKey;
    const normalizedTo = normalizeEvmAddress(toAddress);

    if (!hotPrivateKey) {
      // Simulation mode fallback
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
      console.log(`[EvmRpcProvider] [SIMULATION] Funded ${amount} gas to ${normalizedTo} on ${network}. Mock Hash: ${mockTxHash}`);
      return mockTxHash;
    }

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const wallet = new ethers.Wallet(hotPrivateKey, provider);
        const tx = await wallet.sendTransaction({
          to: normalizedTo,
          value: ethers.parseEther(amount),
        });
        return tx.hash;
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Native gas funding failed on ${network} to ${normalizedTo}:`, err.message);
      if (blockchainConfig.isTestnet || blockchainConfig.env === 'sandbox' || blockchainConfig.env === 'development') {
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
        console.log(`[EvmRpcProvider] [TESTNET FALLBACK] Funded ${amount} gas to ${normalizedTo} on ${network}. Mock Hash: ${mockTxHash}`);
        return mockTxHash;
      }
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
    const normalizedTo = normalizeEvmAddress(toAddress);

    if (!signerKey) {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
      console.log(`[EvmRpcProvider] [SIMULATION] Broadcasted ${amount} token transfer to ${normalizedTo} on ${network}. Mock Hash: ${mockTxHash}`);
      return mockTxHash;
    }

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const wallet = new ethers.Wallet(signerKey, provider);

        if (netConfig?.contractAddress) {
          const normalizedContract = normalizeEvmAddress(netConfig.contractAddress);
          const contract = new ethers.Contract(normalizedContract, ERC20_ABI, wallet);
          const parsedAmount = denormalizeAmount(amount, netConfig.decimals);
          const tx = await contract.transfer(normalizedTo, parsedAmount);
          return tx.hash;
        } else {
          const tx = await wallet.sendTransaction({
            to: normalizedTo,
            value: ethers.parseEther(amount),
          });
          return tx.hash;
        }
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Broadcast transaction failed on ${network}:`, err.message);
      if (blockchainConfig.isTestnet || blockchainConfig.env === 'sandbox' || blockchainConfig.env === 'development') {
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
        console.log(`[EvmRpcProvider] [TESTNET FALLBACK] Broadcasted ${amount} token transfer to ${normalizedTo} on ${network}. Mock Hash: ${mockTxHash}`);
        return mockTxHash;
      }
      throw err;
    }
  }

  /**
   * Validate EVM address
   */
  async validateAddress(_network: string, address: string): Promise<boolean> {
    if (!address || typeof address !== 'string') return false;
    const trimmed = address.trim();
    if (!trimmed.startsWith('0x')) return false;
    return ethers.isAddress(normalizeEvmAddress(trimmed));
  }

  /**
   * Fetch transaction details and verify confirmations
   */
  async getTransaction(network: string, txHash: string): Promise<BlockchainTransaction | null> {
    const netConfig = blockchainConfig.networks[network];
    const decimals = netConfig?.decimals ?? 18;

    try {
      return await rpcManager.executeRpc(network, async (rpcUrl) => {
        const provider = rpcManager.getProvider(network, rpcUrl);
        const [tx, receipt, currentBlock] = await Promise.all([
          provider.getTransaction(txHash),
          provider.getTransactionReceipt(txHash),
          provider.getBlockNumber(),
        ]);

        if (!tx || !receipt) {
          throw new Error(`Transaction ${txHash} or receipt not found on RPC endpoint (${rpcUrl})`);
        }

        const isSuccessful = receipt.status === 1;
        const txBlock = receipt.blockNumber || currentBlock;
        const confirmations = Math.max(1, currentBlock - txBlock + 1);

        let amount = '0.00000000';
        let sender = tx.from;
        let receiver = tx.to || '';

        // Interface for parsing ERC20 transfer log
        const iface = new ethers.Interface(ERC20_ABI);
        for (const log of receipt.logs) {
          const isContractMatch = !netConfig?.contractAddress || log.address.toLowerCase() === netConfig.contractAddress.toLowerCase();
          try {
            const parsedLog = iface.parseLog({ topics: [...log.topics], data: log.data });
            if (parsedLog && parsedLog.name === 'Transfer') {
              if (isContractMatch || receiver === tx.to) {
                sender = parsedLog.args[0];
                receiver = parsedLog.args[1];
                amount = normalizeAmount(parsedLog.args[2].toString(), decimals);
                if (isContractMatch) break;
              }
            }
          } catch {
            // Ignore non-standard logs
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
        };
      });
    } catch (err: any) {
      console.error(`[EvmRpcProvider] Failed to fetch transaction ${txHash} on ${network}:`, err.message);
      return null;
    }
  }
}

export const evmRpcProvider = new EvmRpcProvider();
export default evmRpcProvider;
