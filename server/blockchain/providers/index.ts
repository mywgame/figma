/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { TatumProvider } from './TatumProvider.ts';

// Single provider instance adhering to BlockchainProvider interface
export const activeBlockchainProvider: BlockchainProvider = new TatumProvider();
export default activeBlockchainProvider;
