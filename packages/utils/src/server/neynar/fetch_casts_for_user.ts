import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { FeedResponse } from '@neynar/nodejs-sdk/build/api/models/feed-response.js';
import { logger } from '@wiretap/logger';

interface FetchCastsForUserParams {
  fid: number;
  appFid?: number;
  viewerFid?: number;
  limit?: number;
  cursor?: string;
  includeReplies?: boolean;
  parentUrl?: string;
  channelId?: string;
}

/**
 * https://docs.neynar.com/reference/fetch-casts-for-user
 */
export async function fetchCastsForUser(
  neynarClient: NeynarAPIClient,
  params: FetchCastsForUserParams
): Promise<FeedResponse | undefined> {
  try {
    return await neynarClient.fetchCastsForUser({
      fid: params.fid,
      appFid: params.appFid,
      viewerFid: params.viewerFid,
      limit: params.limit,
      cursor: params.cursor,
      includeReplies: params.includeReplies,
      parentUrl: params.parentUrl,
      channelId: params.channelId
    });
  } catch (error) {
    if (isApiErrorResponse(error)) {
      logger.info(
        'neynarClient.fetchBulkUsers:: API Error',
        error.response.data
      );
    } else {
      logger.info('neynarClient.fetchBulkUsers:: Generic Error', error);
    }
    return undefined;
  }
}
