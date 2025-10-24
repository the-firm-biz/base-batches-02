import { pgTable, text } from 'drizzle-orm/pg-core';
import { createdAt } from '../shared/timestamp.js';
import { uuidv7 } from '../shared/uuid.js';

// Table for X (Twitter) accounts
export const xAccounts = pgTable('x_accounts', {
  id: uuidv7('id').primaryKey(),
  username: text('username').notNull(),
  createdAt
});

export type XAccount = typeof xAccounts.$inferSelect;
export type NewXAccount = typeof xAccounts.$inferInsert;
