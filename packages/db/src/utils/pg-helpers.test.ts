import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { lowerInArray, lowerEq, lower } from './pg-helpers.js';
import { wallets } from '../schema/accounts/wallets.js';
import { unsafe__clearDbTables } from '../queries/unsafe/unsafe-clear-db-tables.js';

describe('pg-helpers', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeAll(async () => {
    await unsafe__clearDbTables(db);
  });

  const address1 = '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6';
  const address2 = '0x70C2c576310892d741ac6faFB74D82D3dd49F4B7';

  beforeEach(async () => {
    await unsafe__clearDbTables(db, ['wallets']);

    await db.insert(wallets).values({
      address: address1
    });
    await db.insert(wallets).values({
      address: address2
    });
  });

  describe('lowerInArray', () => {
    it('should handle empty array without throwing an error and return SQL instance', async () => {
      const sqlResult = lowerInArray(wallets.address, []);

      // Should return a SQL instance
      expect(sqlResult).toBeDefined();
      expect(sqlResult).toBeInstanceOf(Object);
      expect(sqlResult).toHaveProperty('queryChunks');

      // Should execute without SQL syntax error
      const result = await db
        .select()
        .from(wallets)
        .where(sqlResult)
        .catch((error) => error);

      // Should not be an error
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('should work with normal array values and return SQL instance', async () => {
      const testAddresses = [address1, address2];
      const sqlResult = lowerInArray(wallets.address, testAddresses);

      // Should return a SQL instance
      expect(sqlResult).toBeDefined();
      expect(sqlResult).toBeInstanceOf(Object);
      expect(sqlResult).toHaveProperty('queryChunks');

      // Should execute without error
      const result = await db
        .select()
        .from(wallets)
        .where(sqlResult)
        .catch((error) => error);

      // Should not be an error, should be an array, should contain the two wallets
      expect(Array.isArray(result)).toBe(true);
      expect(result).toStrictEqual([
        {
          address: address1,
          id: expect.any(String),
          createdAt: expect.any(Date),
          verificationSourceId: null
        },
        {
          address: address2,
          id: expect.any(String),
          createdAt: expect.any(Date),
          verificationSourceId: null
        }
      ]);
    });

    it('should return an empty array if the addresses do not exist', async () => {
      const sqlResult = lowerInArray(wallets.address, [
        '0x1234567890abcdef',
        '0xabcdef1234567890'
      ]);

      const result = await db
        .select()
        .from(wallets)
        .where(sqlResult)
        .catch((error) => error);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });

  describe('lowerEq', () => {
    it('should work with normal string values and return SQL instance', async () => {
      const sqlResult = lowerEq(wallets.address, address1);

      // Should return a SQL instance
      expect(sqlResult).toBeDefined();
      expect(sqlResult).toBeInstanceOf(Object);
      expect(sqlResult).toHaveProperty('queryChunks');

      // Should execute without error
      const result = await db
        .select()
        .from(wallets)
        .where(sqlResult)
        .catch((error) => error);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toStrictEqual([
        {
          address: address1,
          id: expect.any(String),
          createdAt: expect.any(Date),
          verificationSourceId: null
        }
      ]);
    });

    it('should return an empty array if the address does not exist', async () => {
      const sqlResult = lowerEq(wallets.address, '0x1234567890abcdef');

      const result = await db
        .select()
        .from(wallets)
        .where(sqlResult)
        .catch((error) => error);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });

  describe('lower', () => {
    it('should return SQL instance', () => {
      const sqlResult = lower(wallets.address);

      // Should return a SQL instance
      expect(sqlResult).toBeDefined();
      expect(sqlResult).toBeInstanceOf(Object);
      expect(sqlResult).toHaveProperty('queryChunks');
    });
  });
});
