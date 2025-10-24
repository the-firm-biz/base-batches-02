import { singletonDb } from '../../../client.js';
import { env } from '../../../env.js';
import { eq } from 'drizzle-orm';
import {
  farcasterAccounts,
  horsepowerEvents,
  HorsepowerEventSourceIds,
  horsepowerEventSources,
  type NewFarcasterAccount,
  type NewHorsepowerEventSource
} from '../../../schema/index.js';
import { unsafe__clearDbTables } from '../../unsafe/unsafe-clear-db-tables.js';
import { insertHorsepowerEvents } from './insert-horsepower-event.js';
import { HorsePowerRecipientAccountTypeIds } from '../../../schema/horsepower/horsepower-recipient-account-types.js';
import { insertWallets, insertXAccounts } from '../index.js';

describe('insertHorsepowerEvents', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let testFarcasterAccountId: string;
  let farcasterAccountToUpsert: NewFarcasterAccount;
  let completeAddAppToFarcasterEventSource: NewHorsepowerEventSource;
  let completeEOnboardingEventSource: NewHorsepowerEventSource;
  let completeGreetColleaguesEventSource: NewHorsepowerEventSource;
  let channelBehaviorEventSource: NewHorsepowerEventSource;

  beforeAll(async () => {
    await unsafe__clearDbTables(db);

    farcasterAccountToUpsert = {
      fid: 12345,
      username: 'farcaster-test-username',
      displayName: 'Farcaster Test Display Name',
      pfpUrl: 'https://example.com/pfp.png',
      followerCount: 1000
    };
    completeAddAppToFarcasterEventSource = {
      name: 'completeAddAppToFarcaster',
      id: 1
    };
    completeEOnboardingEventSource = {
      name: 'completeEOnboarding',
      id: 2
    };
    completeGreetColleaguesEventSource = {
      name: 'completeGreetColleagues',
      id: 3
    };
    channelBehaviorEventSource = {
      name: 'channelBehavior',
      id: 4
    };

    // Set up test data - create farcaster account
    const [[farcasterAccount]] = await db.batch([
      db.insert(farcasterAccounts).values(farcasterAccountToUpsert).returning(),
      db
        .insert(horsepowerEventSources)
        .values([
          completeAddAppToFarcasterEventSource,
          completeEOnboardingEventSource,
          completeGreetColleaguesEventSource,
          channelBehaviorEventSource
        ])
    ]);

    testFarcasterAccountId = farcasterAccount!.id;
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db, ['horsepowerEvents']);
  });

  it('allows multiple channelBehavior events for same account with different castHash', async () => {
    await insertHorsepowerEvents(db, [
      {
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        recipientAccountId: testFarcasterAccountId,
        horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
        castHash: '0x123',
        horsePowerAwarded: 100
      },
      {
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        recipientAccountId: testFarcasterAccountId,
        horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
        castHash: '0x456',
        horsePowerAwarded: 200
      }
    ]);

    const events = await db
      .select()
      .from(horsepowerEvents)
      .where(eq(horsepowerEvents.recipientAccountId, testFarcasterAccountId));

    expect(events).toHaveLength(2);
  });

  it('allows one completeAddAppToFarcaster, completeEOnboarding, and completeGreetColleagues event per account', async () => {
    await db.batch([
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId:
            HorsepowerEventSourceIds.completeAddAppToFarcaster,
          horsePowerAwarded: 100
        }
      ]),
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId: HorsepowerEventSourceIds.completeEOnboarding,
          horsePowerAwarded: 100
        }
      ]),
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId:
            HorsepowerEventSourceIds.completeGreetColleagues,
          horsePowerAwarded: 100
        }
      ])
    ]);

    const events = await db
      .select()
      .from(horsepowerEvents)
      .where(eq(horsepowerEvents.recipientAccountId, testFarcasterAccountId));

    const repeatedAssertion = {
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(Number),
      recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
      recipientAccountId: testFarcasterAccountId
    };

    expect(events).toHaveLength(3);
    expect(events[0]).toStrictEqual({
      ...repeatedAssertion,
      horsepowerEventSourceId:
        HorsepowerEventSourceIds.completeAddAppToFarcaster,
      horsePowerAwarded: 100,
      newHorsePowerTotal: 100,
      castHash: null
    });
    expect(events[1]).toStrictEqual({
      ...repeatedAssertion,
      horsepowerEventSourceId: HorsepowerEventSourceIds.completeEOnboarding,
      horsePowerAwarded: 100,
      newHorsePowerTotal: 200,
      castHash: null
    });
    expect(events[2]).toStrictEqual({
      ...repeatedAssertion,
      horsepowerEventSourceId: HorsepowerEventSourceIds.completeGreetColleagues,
      horsePowerAwarded: 100,
      newHorsePowerTotal: 300,
      castHash: null
    });
  });

  it('prevents duplicate channelBehavior events for same account and castHash', async () => {
    // First insert should succeed
    await insertHorsepowerEvents(db, [
      {
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        recipientAccountId: testFarcasterAccountId,
        horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
        castHash: '0xduplicate',
        horsePowerAwarded: 100
      }
    ]);

    // Second insert with same castHash should fail
    await expect(
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
          castHash: '0xduplicate',
          horsePowerAwarded: 200
        }
      ])
    ).rejects.toThrow();
  });

  it('prevents channelBehavior events without castHash', async () => {
    await expect(
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
          horsePowerAwarded: 100
          // castHash is intentionally omitted
        }
      ])
    ).rejects.toThrow();
  });

  it('prevents channelBehavior events with null castHash', async () => {
    await expect(
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
          castHash: null,
          horsePowerAwarded: 100
        }
      ])
    ).rejects.toThrow();
  });

  it('prevents duplicate completeAddAppToFarcaster events for same account', async () => {
    await expect(
      db.batch([
        insertHorsepowerEvents(db, [
          {
            recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
            recipientAccountId: testFarcasterAccountId,
            horsepowerEventSourceId:
              HorsepowerEventSourceIds.completeAddAppToFarcaster,
            horsePowerAwarded: 500
          },
          {
            recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
            recipientAccountId: testFarcasterAccountId,
            horsepowerEventSourceId:
              HorsepowerEventSourceIds.completeAddAppToFarcaster,
            horsePowerAwarded: 500
          }
        ])
      ])
    ).rejects.toThrow();
  });

  it('prevents duplicate completeEOnboarding events for same account', async () => {
    await expect(
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId: HorsepowerEventSourceIds.completeEOnboarding,
          horsePowerAwarded: 500
        },
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId: HorsepowerEventSourceIds.completeEOnboarding,
          horsePowerAwarded: 500
        }
      ])
    ).rejects.toThrow();
  });

  it('prevents duplicate completeGreetColleagues events for same account', async () => {
    await expect(
      insertHorsepowerEvents(db, [
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId:
            HorsepowerEventSourceIds.completeGreetColleagues,
          horsePowerAwarded: 500
        },
        {
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: testFarcasterAccountId,
          horsepowerEventSourceId:
            HorsepowerEventSourceIds.completeGreetColleagues,
          horsePowerAwarded: 500
        }
      ])
    ).rejects.toThrow();
  });

  it('tracks newHorsePowerTotal via the insert trigger even when newHorsePowerToal is passed', async () => {
    await insertHorsepowerEvents(db, [
      {
        recipientAccountId: testFarcasterAccountId,
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        horsepowerEventSourceId: channelBehaviorEventSource.id,
        horsePowerAwarded: 100,
        newHorsePowerTotal: 500000,
        castHash: '0xtest1'
      },
      {
        recipientAccountId: testFarcasterAccountId,
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        horsepowerEventSourceId: completeAddAppToFarcasterEventSource.id,
        horsePowerAwarded: 400,
        newHorsePowerTotal: 9
      },
      {
        recipientAccountId: testFarcasterAccountId,
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        horsepowerEventSourceId: channelBehaviorEventSource.id,
        horsePowerAwarded: 200,
        newHorsePowerTotal: 300,
        castHash: '0xtest2'
      }
    ]);

    const events = await db
      .select()
      .from(horsepowerEvents)
      .where(eq(horsepowerEvents.recipientAccountId, testFarcasterAccountId));

    const repeatedAssertion = {
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(Number),
      recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
      recipientAccountId: testFarcasterAccountId
    };

    expect(events).toHaveLength(3);
    expect(events[2]).toStrictEqual({
      horsepowerEventSourceId: channelBehaviorEventSource.id,
      ...repeatedAssertion,
      newHorsePowerTotal: 700,
      horsePowerAwarded: 200,
      castHash: '0xtest2'
    });
    expect(events[1]).toStrictEqual({
      ...repeatedAssertion,
      horsepowerEventSourceId: completeAddAppToFarcasterEventSource.id,
      newHorsePowerTotal: 500,
      horsePowerAwarded: 400,
      castHash: null
    });
    expect(events[0]).toStrictEqual({
      horsepowerEventSourceId: channelBehaviorEventSource.id,
      ...repeatedAssertion,
      newHorsePowerTotal: 100,
      horsePowerAwarded: 100,
      castHash: '0xtest1'
    });
  });

  it('correctly inserts horsepower events for wallet', async () => {
    const [wallet] = await insertWallets(db, [
      {
        address: '0x1234567890123456789012345678901234567890'
      }
    ]);

    const [event] = await insertHorsepowerEvents(db, [
      {
        recipientAccountId: wallet!.id,
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Wallet,
        horsepowerEventSourceId: channelBehaviorEventSource.id,
        horsePowerAwarded: 100,
        castHash: '0xwallettest'
      }
    ]).returning();

    expect(event).toStrictEqual({
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(Number),
      recipientAccountId: wallet!.id,
      recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Wallet,
      horsepowerEventSourceId: channelBehaviorEventSource.id,
      horsePowerAwarded: 100,
      newHorsePowerTotal: 100,
      castHash: '0xwallettest'
    });
  });

  it('throws inserting horsepower events for x account even if it exists', async () => {
    const [xAccount] = await insertXAccounts(db, [
      {
        username: 'x-test-username'
      }
    ]);

    await expect(
      insertHorsepowerEvents(db, [
        {
          recipientAccountId: xAccount!.id,
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Wallet,
          horsepowerEventSourceId: channelBehaviorEventSource.id,
          horsePowerAwarded: 100
        }
      ])
    ).rejects.toThrow();
  });

  it('handles negative horsePowerAwarded', async () => {
    const [event] = await insertHorsepowerEvents(db, [
      {
        recipientAccountId: testFarcasterAccountId,
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        horsepowerEventSourceId: channelBehaviorEventSource.id,
        horsePowerAwarded: -100,
        castHash: '0xnegativetest'
      }
    ]).returning();

    expect(event).toStrictEqual({
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(Number),
      recipientAccountId: testFarcasterAccountId,
      recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
      horsepowerEventSourceId: channelBehaviorEventSource.id,
      horsePowerAwarded: -100,
      newHorsePowerTotal: -100,
      castHash: '0xnegativetest'
    });
  });

  it('handles zero horsePowerAwarded', async () => {
    const [event] = await insertHorsepowerEvents(db, [
      {
        recipientAccountId: testFarcasterAccountId,
        recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
        horsepowerEventSourceId: channelBehaviorEventSource.id,
        horsePowerAwarded: 0,
        castHash: '0xzerotest'
      }
    ]).returning();
    expect(event).toStrictEqual({
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(Number),
      recipientAccountId: testFarcasterAccountId,
      recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
      horsepowerEventSourceId: channelBehaviorEventSource.id,
      horsePowerAwarded: 0,
      newHorsePowerTotal: 0,
      castHash: '0xzerotest'
    });
  });
});
