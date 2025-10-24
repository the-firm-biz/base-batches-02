import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../../../client.js';
import {
  farcasterAccounts,
  type FarcasterAccount,
  type NewFarcasterAccount
} from '../../../schema/accounts/index.js';
import { sql } from 'drizzle-orm';

export async function upsertFarcasterAccounts(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newFarcasterAccounts: NewFarcasterAccount[]
): Promise<FarcasterAccount[]> {
  if (newFarcasterAccounts.length === 0) {
    return [];
  }

  const upsertedFarcasterAccounts = await db
    .insert(farcasterAccounts)
    .values(newFarcasterAccounts)
    .onConflictDoUpdate({
      target: farcasterAccounts.fid,
      set: {
        username: sql`excluded.username`,
        displayName: sql`excluded.display_name`,
        pfpUrl: sql`excluded.pfp_url`,
        followerCount: sql`excluded.follower_count`
      }
    })
    .returning();

  return upsertedFarcasterAccounts;
}
