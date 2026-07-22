/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NetworkConfig {
  contractAddress: string;
  xpub: string;
  hotPrivateKey: string;
  chainName: string;
}

const apiKey = process.env.TATUM_API_KEY || '';
const isTestnet = apiKey.startsWith('t-') || process.env.IS_TESTNET === 'true';

export const blockchainConfig = {
  apiKey: apiKey,
  isConfigured: !!apiKey,
  isTestnet: isTestnet,
  
  networks: {
    USDT_BEP20: {
      contractAddress: process.env.USDT_BEP20_CONTRACT || (isTestnet 
        ? '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' 
        : '0x55d398326f99059ff775485246999027b3197955'),
      xpub: process.env.USDT_BEP20_XPUB || '',
      hotPrivateKey: process.env.USDT_BEP20_HOT_PRIVATE_KEY || '',
      chainName: 'BSC',
    } as NetworkConfig,
    
    USDT_POLYGON: {
      contractAddress: process.env.USDT_POLYGON_CONTRACT || (isTestnet 
        ? '0x41e94eb019c0762f9bfcf9fb1e58725bfb01728b' 
        : '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'),
      xpub: process.env.USDT_POLYGON_XPUB || '',
      hotPrivateKey: process.env.USDT_POLYGON_HOT_PRIVATE_KEY || '',
      chainName: 'POLYGON',
    } as NetworkConfig,
    
    USDT_TRC20: {
      contractAddress: process.env.USDT_TRC20_CONTRACT || (isTestnet 
        ? 'TXYZdfUrW2Dx79gSStj7Q47S8oexuF3pC3' 
        : 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'),
      xpub: process.env.USDT_TRC20_XPUB || '',
      hotPrivateKey: process.env.USDT_TRC20_HOT_PRIVATE_KEY || '',
      chainName: 'TRON',
    } as NetworkConfig,
  } as Record<string, NetworkConfig>,
};
export default blockchainConfig;
