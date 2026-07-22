/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, text, integer, timestamp, index, uniqueIndex, decimal } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

// Stores permanent cryptocurrency deposit addresses per user per supported blockchain network
export const depositAddresses = pgTable(
  'deposit_addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    network: text('network').notNull(), // e.g. 'USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20', etc.
    address: text('address').notNull(), // Unique generated blockchain wallet address
    derivationIndex: integer('derivation_index'), // Sequential HD Wallet index
    qrPath: text('qr_path'), // Locally generated QR code path/URL reference
    onChainBalance: decimal('on_chain_balance', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    nativeBalance: decimal('native_balance', { precision: 20, scale: 8 }).default('0.00000000').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('deposit_addresses_user_network_idx').on(table.userId, table.network),
    uniqueIndex('deposit_addresses_address_idx').on(table.address),
    index('deposit_addresses_user_idx').on(table.userId),
  ]
);
