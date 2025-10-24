import { inArray } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../../../client.js';
import {
  wallets,
  type NewWallet,
  type Wallet
} from '../../../schema/accounts/index.js';

export async function insertWallets(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newWallets: NewWallet[]
): Promise<Wallet[]> {
  if (newWallets.length === 0) {
    return [];
  }

  const createdWallets = await db
    .insert(wallets)
    .values(newWallets)
    .onConflictDoNothing()
    .returning();

  if (createdWallets.length !== newWallets.length) {
    const addresses = newWallets.map((w) => w.address);
    return await db
      .select()
      .from(wallets)
      .where(inArray(wallets.address, addresses));
  }

  return createdWallets;
}
