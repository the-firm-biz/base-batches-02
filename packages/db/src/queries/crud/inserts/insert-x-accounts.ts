import { inArray } from 'drizzle-orm';
import {
  xAccounts,
  type NewXAccount,
  type XAccount
} from '../../../schema/accounts/index.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../../../client.js';

export async function insertXAccounts(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newXAccounts: NewXAccount[]
): Promise<XAccount[]> {
  if (newXAccounts.length === 0) {
    return [];
  }

  const createdXAccounts = await db
    .insert(xAccounts)
    .values(newXAccounts)
    .onConflictDoNothing()
    .returning();

  if (createdXAccounts.length !== newXAccounts.length) {
    const usernames = newXAccounts.map((x) => x.username);
    return await db
      .select()
      .from(xAccounts)
      .where(inArray(xAccounts.username, usernames));
  }

  return createdXAccounts;
}
