import { singletonDb } from '../../../client.js';
import { env } from '../../../env.js';
import {
  farcasterAccounts,
  type NewFarcasterAccount
} from '../../../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../../unsafe/unsafe-clear-db-tables.js';
import { upsertFarcasterAccounts } from './upsert-farcaster-accounts.js';

describe('upsertFarcasterAccounts', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeAll(async () => {
    await unsafe__clearDbTables(db);
  });

  let farcasterAccountToUpsert: NewFarcasterAccount;

  beforeEach(async () => {
    await unsafe__clearDbTables(db, ['farcasterAccounts']);
    farcasterAccountToUpsert = {
      fid: 12345,
      username: 'farcaster-test-username',
      displayName: 'Farcaster Test Display Name',
      pfpUrl: 'https://example.com/pfp.png',
      followerCount: 1000
    };
  });

  it('creates and returns single Farcaster Account', async () => {
    const response = await upsertFarcasterAccounts(db, [
      farcasterAccountToUpsert
    ]);
    const dbFarcasterAccounts = await db.select().from(farcasterAccounts);
    expect(dbFarcasterAccounts.length).toBe(1);
    expect(dbFarcasterAccounts[0]!).toStrictEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      ...farcasterAccountToUpsert
    });
    expect(response).toStrictEqual(dbFarcasterAccounts);
    expect(response[0]).toStrictEqual(dbFarcasterAccounts[0]);
  });

  it('creates and returns multiple Farcaster Accounts', async () => {
    const secondFarcasterAccount: NewFarcasterAccount = {
      fid: 67890,
      username: 'second-user',
      displayName: 'Second User',
      pfpUrl: 'https://example.com/second-pfp.png',
      followerCount: 500
    };

    const response = await upsertFarcasterAccounts(db, [
      farcasterAccountToUpsert,
      secondFarcasterAccount
    ]);
    const dbFarcasterAccounts = await db.select().from(farcasterAccounts);
    expect(dbFarcasterAccounts.length).toBe(2);
    expect(response.length).toBe(2);
    expect(response).toStrictEqual(dbFarcasterAccounts);

    // Check first account
    expect(dbFarcasterAccounts[0]!).toStrictEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      ...farcasterAccountToUpsert
    });

    // Check second account
    expect(dbFarcasterAccounts[1]!).toStrictEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      ...secondFarcasterAccount
    });
  });

  it('updates existing Farcaster Account when fid conflicts', async () => {
    // First, create the account
    const initialResponse = await upsertFarcasterAccounts(db, [
      farcasterAccountToUpsert
    ]);
    const initialId = initialResponse[0]!.id;
    const initialCreatedAt = initialResponse[0]!.createdAt;

    // Verify the initial state in the database
    const initialDbState = await db.select().from(farcasterAccounts);
    expect(initialDbState[0]!.username).toBe(farcasterAccountToUpsert.username);
    expect(initialDbState[0]!.displayName).toBe(
      farcasterAccountToUpsert.displayName
    );

    // Update the account with new values
    const updatedFarcasterAccount: NewFarcasterAccount = {
      fid: farcasterAccountToUpsert.fid, // Same fid to trigger conflict
      username: 'updated-username',
      displayName: 'Updated Display Name',
      pfpUrl: 'https://example.com/updated-pfp.png',
      followerCount: 2000
    };

    const response = await upsertFarcasterAccounts(db, [
      updatedFarcasterAccount
    ]);
    const dbFarcasterAccounts = await db.select().from(farcasterAccounts);

    expect(dbFarcasterAccounts.length).toBe(1);
    expect(response.length).toBe(1);
    expect(response).toStrictEqual(dbFarcasterAccounts);

    // Verify the data was updated but id and createdAt remained the same
    expect(dbFarcasterAccounts[0]!).toStrictEqual({
      id: initialId,
      createdAt: initialCreatedAt,
      ...updatedFarcasterAccount
    });
    expect(dbFarcasterAccounts[0]!.username).toBe(
      updatedFarcasterAccount.username
    );
    expect(dbFarcasterAccounts[0]!.displayName).toBe(
      updatedFarcasterAccount.displayName
    );
    expect(dbFarcasterAccounts[0]!.pfpUrl).toBe(updatedFarcasterAccount.pfpUrl);
    expect(dbFarcasterAccounts[0]!.followerCount).toBe(
      updatedFarcasterAccount.followerCount
    );
  });

  it('creates new accounts and updates existing ones in mixed batch', async () => {
    // First, create one account
    const initialResponse = await upsertFarcasterAccounts(db, [
      farcasterAccountToUpsert
    ]);
    const initialId = initialResponse[0]!.id;
    const initialCreatedAt = initialResponse[0]!.createdAt;

    // Prepare batch with one update and one new account
    const updatedFarcasterAccount: NewFarcasterAccount = {
      fid: farcasterAccountToUpsert.fid, // Same fid to trigger conflict
      username: 'updated-username',
      displayName: 'Updated Display Name',
      pfpUrl: 'https://example.com/updated-pfp.png',
      followerCount: 2000
    };

    const newFarcasterAccount2: NewFarcasterAccount = {
      fid: 99999,
      username: 'new-user',
      displayName: 'New User',
      pfpUrl: 'https://example.com/new-pfp.png',
      followerCount: 750
    };

    const response = await upsertFarcasterAccounts(db, [
      updatedFarcasterAccount,
      newFarcasterAccount2
    ]);
    const dbFarcasterAccounts = await db.select().from(farcasterAccounts);

    expect(dbFarcasterAccounts.length).toBe(2);
    expect(response.length).toBe(2);
    expect(response).toStrictEqual(dbFarcasterAccounts);

    // Find the updated account (should have same id and createdAt)
    const updatedAccount = dbFarcasterAccounts.find(
      (acc) => acc.id === initialId
    );
    expect(updatedAccount).toBeDefined();
    expect(updatedAccount!).toStrictEqual({
      id: initialId,
      createdAt: initialCreatedAt,
      ...updatedFarcasterAccount
    });

    // Find the new account (should have new id and createdAt)
    const newAccount = dbFarcasterAccounts.find(
      (acc) => acc.fid === newFarcasterAccount2.fid
    );
    expect(newAccount).toBeDefined();
    expect(newAccount!).toStrictEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      ...newFarcasterAccount2
    });
  });
});
