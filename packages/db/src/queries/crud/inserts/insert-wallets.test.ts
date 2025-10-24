import { singletonDb } from '../../../client.js';
import { env } from '../../../env.js';
import {
  wallets,
  type NewWallet
} from '../../../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../../unsafe/unsafe-clear-db-tables.js';
import { insertWallets } from './insert-wallets.js';

describe('insertWallets', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeAll(async () => {
    await unsafe__clearDbTables(db);
  });

  let newWallet1: NewWallet;
  let newWallet2: NewWallet;

  beforeEach(async () => {
    await unsafe__clearDbTables(db, ['wallets']);
    newWallet1 = {
      address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6'
    };
    newWallet2 = {
      address: '0x70C2c576310892d741ac6faFB74D82D3dd49F4B7'
    };
  });

  it('creates and returns Wallets', async () => {
    const response = await insertWallets(db, [newWallet1, newWallet2]);
    const dbWallets = await db.select().from(wallets);
    expect(dbWallets.length).toBe(2);
    expect(dbWallets).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          verificationSourceId: null,
          ...newWallet1
        },
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          verificationSourceId: null,
          ...newWallet2
        }
      ])
    );
    expect(response).toStrictEqual(dbWallets);
  });
});
