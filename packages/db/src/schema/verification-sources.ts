import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createdAt } from './shared/timestamp.js';

export const VerificationSourceIds = {
  Farcaster: 1,
  WireTap: 2,
  Privy: 3
} as const;

export const verificationSources = pgTable(
  'verification_sources',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    createdAt
  },
  (t) => [
    uniqueIndex('verification_source_name_unique').on(sql`LOWER(${t.name})`)
  ]
);

export type VerificationSource = typeof verificationSources.$inferSelect;
export type NewVerificationSource = typeof verificationSources.$inferInsert;
