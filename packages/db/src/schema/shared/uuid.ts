import { sql, type AnyColumn } from 'drizzle-orm';
import { uuid } from 'drizzle-orm/pg-core';

export const uuidv7 = (name: string) =>
  uuid(name).default(sql`uuid_generate_v7()`);

/**
 * Helper to cast a UUID column to text for comparisons with text columns.
 * Useful when joining UUID primary keys with text foreign key references.
 *
 * @example
 * ```typescript
 * .innerJoin(
 *   farcasterAccounts,
 *   eq(horsepowerEvents.recipientAccountId, uuidAsText(farcasterAccounts.id))
 * )
 * ```
 */
export const uuidAsText = (column: AnyColumn) => sql<string>`${column}::text`;
