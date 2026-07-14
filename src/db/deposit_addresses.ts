/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, uuid, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
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
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('deposit_addresses_user_network_idx').on(table.userId, table.network),
    uniqueIndex('deposit_addresses_address_idx').on(table.address),
    index('deposit_addresses_user_idx').on(table.userId),
  ]
);
