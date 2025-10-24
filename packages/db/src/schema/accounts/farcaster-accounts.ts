import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { createdAt } from '../shared/timestamp.js';
import { uuidv7 } from '../shared/uuid.js';

// Table for Farcaster accounts
export const farcasterAccounts = pgTable('farcaster_accounts', {
  id: uuidv7('id').primaryKey(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  pfpUrl: text('pfp_url'),
  followerCount: integer('follower_count'),
  fid: integer('fid').notNull().unique(),
  createdAt
});

export type FarcasterAccount = typeof farcasterAccounts.$inferSelect;
export type NewFarcasterAccount = typeof farcasterAccounts.$inferInsert;
