import { lower } from '../../utils/pg-helpers.js';
import { pgTable, text, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { verificationSources } from '../verification-sources.js';
import { createdAt } from '../shared/timestamp.js';
import { uuidv7 } from '../shared/uuid.js';

// Table for wallet addresses
export const wallets = pgTable(
  'wallets',
  {
    id: uuidv7('id').primaryKey(),
    address: text('address').notNull(),
    verificationSourceId: integer('verification_source_id').references(
      () => verificationSources.id
    ),
    createdAt
  },
  (table) => [
    uniqueIndex('wallets_address_lower_unique').on(lower(table.address))
  ]
);

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
