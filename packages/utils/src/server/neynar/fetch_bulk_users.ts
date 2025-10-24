import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';
import { logger } from '@wiretap/logger';

/**
 * https://docs.neynar.com/reference/fetch-bulk-users
 */
export async function fetchBulkUsers(
  neynarClient: NeynarAPIClient,
  fids: string[] | number[]
) {
  try {
    const response = await neynarClient.fetchBulkUsers({
      fids: fids.map(Number)
    });
    return response.users;
  } catch (error) {
    if (isApiErrorResponse(error)) {
      logger.info(
        'neynarClient.fetchBulkUsers:: API Error',
        error.response.data
      );
    } else {
      logger.info('neynarClient.fetchBulkUsers:: Generic Error', error);
    }
  }
}
