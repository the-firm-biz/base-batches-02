import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createdAt } from '../shared/timestamp.js';

export const HorsePowerRecipientAccountTypeIds = {
  Farcaster: 1,
  /** Note wallet support is future-proofing. At the moment only farcaster accounts are used */
  Wallet: 2
} as const;

export const horsePowerRecipientAccountTypes = pgTable(
  'horsepower_recipient_account_types',
  {
    id: integer('id').primaryKey(),
    /**  farcaster_accounts or wallets */
    tableName: text('table_name').notNull(),
    createdAt
  },
  (t) => [
    uniqueIndex('horsepower_recipient_account_type_table_name_unique').on(
      sql`LOWER(${t.tableName})`
    )
  ]
);

export type HorsePowerAccountType =
  typeof horsePowerRecipientAccountTypes.$inferSelect;
export type NewHorsePowerAccountType =
  typeof horsePowerRecipientAccountTypes.$inferInsert;
