import {
  getSingletonNeynarClient,
  fetchCastsForUser,
  fetchBulkUsers
} from '@wiretap/utils/server';
import {
  HorsepowerEventSourceIds,
  HorsePowerRecipientAccountTypeIds,
  insertHorsepowerEvents,
  singletonDb,
  upsertFarcasterAccounts
} from '@wiretap/db';
import { extractHorsepowerValue } from '@wiretap/utils/shared';
import { config } from 'dotenv';

config({ path: '.env.local' });

const neynarApiKeyValue = process.env.NEYNAR_API_KEY;
const databaseUrlValue = process.env.DATABASE_URL;
const horsepowerAwardingFid =
  process.env.REINDEX_SCRIPT_HORSEPOWER_AWARDING_FID;

interface AwardedHorsepowerCast {
  parentCastHash: string;
  parentCastAuthorFid: number;
  commentorFid: number;
  commentText: string;
  commentCastHash: string;
  commentTimestampMs: number;
  horsepowerValue: number;
}

if (!neynarApiKeyValue) {
  throw new Error('NEYNAR_API_KEY environment variable is required');
}

if (!databaseUrlValue) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!horsepowerAwardingFid) {
  throw new Error('HORSEPOWER_AWARDING_FID environment variable is required');
}

const neynarClient = getSingletonNeynarClient({
  apiKey: neynarApiKeyValue
});

async function fetchAllHorsePowerCastsAwardedByFid(
  fid: number
): Promise<AwardedHorsepowerCast[]> {
  const awardedCasts: AwardedHorsepowerCast[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetchCastsForUser(neynarClient, {
        fid,
        limit: 100,
        cursor: cursor || undefined
      });

      if (!response || !response.casts) {
        console.log('No response or casts for FID', fid);
        break;
      }

      for (const cast of response.casts) {
        const horsepowerValue = extractHorsepowerValue(cast.text);

        if (horsepowerValue === null) {
          console.log('No HP value for cast - skipping', {
            castText: cast.text,
            castHash: cast.hash,
            authorFid: cast.parent_author.fid
          });
          continue;
        }

        if (!cast.parent_author.fid || !cast.parent_hash) {
          console.log('No parent author or hash for cast - skipping', {
            castHash: cast.hash,
            castText: cast.text
          });
          continue;
        }

        console.log('Adding cast to awarded casts', {
          castHash: cast.hash,
          castText: cast.text,
          authorFid: cast.parent_author.fid,
          horsepowerValue
        });

        awardedCasts.push({
          parentCastHash: cast.parent_hash,
          parentCastAuthorFid: cast.parent_author.fid,
          commentorFid: cast.author.fid,
          commentText: cast.text,
          commentCastHash: cast.hash,
          commentTimestampMs: new Date(cast.timestamp).getTime(),
          horsepowerValue
        });
      }

      cursor = response.next?.cursor;
      hasMore = !!cursor;
    } catch (error) {
      console.error('Error fetching casts for FID', fid, error);
      break;
    }
  }

  return awardedCasts;
}

export async function reindexHorsepowerEventsAwardedByFid(
  fid: number
): Promise<void> {
  const db = singletonDb({
    databaseUrl: databaseUrlValue!
  });

  try {
    console.log('Starting horsepower reindex for FID', fid);

    // Fetch all casts from this FID that award horsepower
    const castsWithHp = await fetchAllHorsePowerCastsAwardedByFid(fid);

    if (castsWithHp.length === 0) {
      console.log('No horsepower casts found for FID', fid);
      return;
    }

    console.log(
      `Found ${castsWithHp.length} casts awarding horsepower for ${fid}`
    );

    let successfullyInserted = 0;
    let rejectedCount = 0;
    let duplicatedCount = 0;

    // Process in batches to avoid overwhelming the database
    const batchSize = 100;

    // fetch-casts-for-user returns casts in reverse chronological order
    // we want to process them in chronological order
    const chronologicallySortedCasts = castsWithHp.reverse();

    for (let i = 0; i < chronologicallySortedCasts.length; i += batchSize) {
      const batch = chronologicallySortedCasts.slice(i, i + batchSize);
      console.log(
        'Processing batch of',
        batch.length,
        'index',
        i / batchSize + 1,
        'of',
        Math.ceil(chronologicallySortedCasts.length / batchSize)
      );

      // Get unique parent cast author FIDs from this batch
      const uniqueParentAuthorFids = [
        ...new Set(batch.map((cast) => cast.parentCastAuthorFid))
      ];

      // Fetch user data for all unique parent cast authors
      const parentCastUsers = await fetchBulkUsers(
        neynarClient,
        uniqueParentAuthorFids
      );

      if (!parentCastUsers) {
        console.log(
          'Failed to fetch user data for parent cast authors',
          uniqueParentAuthorFids
        );
        continue;
      }

      // First upsert all farcaster accounts
      const farcasterAccountsToUpsert = parentCastUsers.map((user) => ({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        followerCount: user.follower_count
      }));

      const upsertedAccounts = await upsertFarcasterAccounts(
        db,
        farcasterAccountsToUpsert
      );

      // Create a map of FID to db account ID for quick lookups
      const accountIdByFid = new Map(
        upsertedAccounts.map((account) => [account.fid, account.id])
      );

      // Prepare horsepower events for insertion
      const horsepowerEventsToInsert = batch
        .filter((cast) => {
          const accountId = accountIdByFid.get(cast.parentCastAuthorFid);
          if (!accountId) {
            console.log(
              'No account ID found for parent cast author FID',
              cast.parentCastAuthorFid
            );
            return false;
          }
          return true;
        })
        .map((cast) => ({
          horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
          recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
          recipientAccountId: accountIdByFid.get(cast.parentCastAuthorFid)!,
          castHash: cast.parentCastHash,
          horsePowerAwarded: cast.horsepowerValue
        }));

      console.log(
        `Attempting to insert ${horsepowerEventsToInsert.length} horsepower events`
      );

      // Insert horsepower events
      const insertedEvents: {
        status: 'fulfilled' | 'duplicate' | 'error';
        value?: any;
        reason?: any;
      }[] = [];

      // Note inserted one at a time because of the unique constraint
      for (const event of horsepowerEventsToInsert) {
        try {
          const result = await insertHorsepowerEvents(db, [event]).returning();
          insertedEvents.push({ status: 'fulfilled', value: result[0] });
          successfullyInserted++;
        } catch (error: any) {
          if (error.constraint === 'unique_one_time_events_per_cast_hash') {
            insertedEvents.push({ status: 'duplicate', reason: error });
            duplicatedCount++;
          } else {
            console.error('Error inserting horsepower event', error);
            insertedEvents.push({ status: 'error', reason: error });
            rejectedCount++;
          }
        }
      }
    }

    console.log('Horsepower reindex COMPLETED 🌟', {
      fid,
      totalCastsWithHp: castsWithHp.length,
      successfullyInserted,
      rejectedCount,
      duplicatedCount
    });
  } catch (error) {
    console.error('ERROR:: Horsepower reindex FAILED 🚨', fid, error);
    throw error;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  reindexHorsepowerEventsAwardedByFid(Number(horsepowerAwardingFid))
    .then(() => {
      console.log('Reindex script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reindex script failed', error);
      process.exit(1);
    });
}
