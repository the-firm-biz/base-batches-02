import '../../utils/init-web-socket-constructor';

import { api } from 'encore.dev/api';
import { secret } from 'encore.dev/config';
import log from 'encore.dev/log';
import {
  HorsepowerEvent,
  HorsepowerEventSourceIds,
  HorsePowerRecipientAccountTypeIds,
  insertHorsepowerEvents,
  PooledDbConnection,
  upsertFarcasterAccounts
} from '@wiretap/db';
import { getIncomingMessageBody } from '../../utils/get-incoming-message-body';
import { extractHorsepowerValue } from '@wiretap/utils/shared';
import {
  fetchBulkUsers,
  getSingletonNeynarClient
} from '@wiretap/utils/server';

const databaseUrlSecret = secret('DatabaseUrl');
const databaseUrlValue = databaseUrlSecret();
const neynarApiKeySecret = secret('NeynarApiKey');
const neynarApiKeyValue = neynarApiKeySecret();

// Partial interface of what's sent to the webhook
interface WebhookParsedBody {
  data: {
    hash: string;
    text: string;
    parent_hash: string | null;
    parent_author: {
      fid: number | null;
    };
    author: {
      fid: number;
      pfp_url: string;
      username: string;
      follower_count: number;
      display_name: string;
    };
  };
}

// @todo jeff hp - add webhook validation
export const webhook = api.raw(
  { method: 'POST', path: '/neynar/webhooks/horsepower-comment', expose: true },
  async (req, res): Promise<void> => {
    const bodyJson = await getIncomingMessageBody(req);
    const parsedBody = JSON.parse(bodyJson) as WebhookParsedBody;

    const horsepowerValue = extractHorsepowerValue(parsedBody.data.text);

    if (horsepowerValue === null) {
      log.info('Comment is NOT awarding HP - skipping', {
        commentorFid: parsedBody.data.author.fid,
        commentText: parsedBody.data.text,
        commentCastHash: parsedBody.data.hash
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, reason: 'NOT_AWARDING_HP' }));
      return;
    }

    let insertedEvents: HorsepowerEvent[] | null = null;
    const parentCastAuthorFid = parsedBody.data.parent_author.fid;
    const parentCastHash = parsedBody.data.parent_hash;

    if (!parentCastAuthorFid || !parentCastHash) {
      log.warn(
        'Comment IS awarding HP but no parent cast author or hash found - skipping',
        {
          commentorFid: parsedBody.data.author.fid,
          commentText: parsedBody.data.text,
          commentCastHash: parsedBody.data.hash,
          parentCastAuthorFid,
          parentCastHash
        }
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, reason: 'NO_PARENT_CAST' }));
      return;
    }

    const poolDb = new PooledDbConnection({ databaseUrl: databaseUrlValue });
    const neynarClient = getSingletonNeynarClient({
      apiKey: neynarApiKeyValue
    });

    const userResponse = await fetchBulkUsers(neynarClient, [
      parentCastAuthorFid
    ]);

    const parentCastNeynarUser = userResponse?.[0] || null;

    if (!parentCastNeynarUser) {
      log.warn('Parent cast author NOT found in Neynar - skipping', {
        parentCastAuthorFid
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          reason: 'PARENT_AUTHOR_NOT_FOUND_IN_NEYNAR'
        })
      );
      return;
    }

    try {
      await poolDb.db.transaction(async (tx) => {
        const [parentCastFarcasterAccount] = await upsertFarcasterAccounts(tx, [
          {
            fid: parentCastNeynarUser.fid,
            username: parentCastNeynarUser.username,
            displayName: parentCastNeynarUser.display_name,
            pfpUrl: parentCastNeynarUser.pfp_url,
            followerCount: parentCastNeynarUser.follower_count
          }
        ]);

        if (!parentCastFarcasterAccount) {
          throw new Error('Failed to upsert Farcaster account');
        }

        insertedEvents = await insertHorsepowerEvents(tx, [
          {
            horsepowerEventSourceId: HorsepowerEventSourceIds.channelBehavior,
            recipientAccountTypeId: HorsePowerRecipientAccountTypeIds.Farcaster,
            recipientAccountId: parentCastFarcasterAccount.id,
            castHash: parentCastHash,
            horsePowerAwarded: horsepowerValue
          }
        ]).returning();
      });
    } catch (error: any) {
      if (error.constraint === 'unique_one_time_events_per_cast_hash') {
        log.warn('HP already awarded for this cast - skipping', {
          parentCastAuthorFid,
          parentCastHash
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, reason: 'ALREADY_AWARDED' }));
        return;
      }

      log.error('Error processing horsepower comment webhook', { error });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          reason: 'DATABASE_ERROR',
          message:
            error instanceof Error ? error.message : 'Database operation failed'
        })
      );
      return;
    } finally {
      await poolDb.endPoolConnection();
    }

    const responseData = {
      success: true,
      commentorFid: parsedBody.data.author.fid,
      commentText: parsedBody.data.text,
      commentCastHash: parsedBody.data.hash,
      parentCastAuthorFid,
      parentCastHash,
      events: insertedEvents ? JSON.stringify(insertedEvents) : []
    };

    log.info('horsepower-comment webhook responseData', { responseData });
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(responseData))
    });
    res.end(JSON.stringify(responseData));
  }
);
