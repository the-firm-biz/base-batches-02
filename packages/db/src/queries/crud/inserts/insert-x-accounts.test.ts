import { singletonDb } from '../../../client.js';
import { env } from '../../../env.js';
import { type NewXAccount, xAccounts } from '../../../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../../unsafe/unsafe-clear-db-tables.js';
import { insertXAccounts } from './insert-x-accounts.js';

describe('insertXAccounts', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeAll(async () => {
    await unsafe__clearDbTables(db);
  });

  let newXAccount: NewXAccount;
  let newXAccount2: NewXAccount;

  beforeEach(async () => {
    await unsafe__clearDbTables(db, [
      'wallets',
      'farcasterAccounts',
      'xAccounts'
    ]);
    newXAccount = {
      username: 'x-test-username'
    };
    newXAccount2 = {
      username: 'x-test-username2'
    };
  });

  it('creates and returns X Accounts', async () => {
    const response = await insertXAccounts(db, [newXAccount, newXAccount2]);
    const dbXAccounts = await db.select().from(xAccounts);
    expect(dbXAccounts.length).toBe(2);
    expect(dbXAccounts[0]!).toStrictEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      ...newXAccount
    });
    expect(response).toStrictEqual(dbXAccounts);
  });
});
