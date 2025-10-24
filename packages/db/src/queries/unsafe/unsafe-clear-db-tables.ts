import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  farcasterAccounts,
  wallets,
  xAccounts
} from '../../schema/accounts/index.js';
import { verificationSources } from '../../schema/verification-sources.js';
import { horsepowerEvents } from '../../schema/horsepower/horsepower-events.js';
import { horsepowerEventSources } from '../../schema/horsepower/horsepower-event-sources.js';

// Map of table names to their schema objects for selective clearing
const TABLE_MAP = {
  horsepowerEvents,
  horsepowerEventSources,
  wallets,
  farcasterAccounts,
  xAccounts,
  verificationSources
} as const;

// Default order for clearing all tables (respects foreign key dependencies)
// Delete order: child tables first, then parent tables
const DEFAULT_CLEAR_ORDER = [
  'horsepowerEvents', // Depends on farcasterAccounts/wallets and horsepowerEventSources
  'horsepowerEventSources', // Independent
  
  // Base tables that others depend on
  'farcasterAccounts', // Independent
  'wallets', // Depends on verificationSources
  'xAccounts', // Independent
  
  // Independent tables
  'verificationSources'
] as const;

/**
 * WARNING: This function is unsafe and should only be used in test files
 *
 * Deletes all rows from specified database tables
 * @param db - Database instance
 * @param tableNames - Optional array of table names to clear. If not provided, clears all tables.
 */
export const unsafe__clearDbTables = async (
  db: NeonHttpDatabase,
  tableNames?: ReadonlyArray<keyof typeof TABLE_MAP>
) => {
  const tablesToClear = tableNames || DEFAULT_CLEAR_ORDER;

  if (tablesToClear.length === 0) {
    return;
  }

  const deleteQueries = tablesToClear.map((tableName) => {
    const table = TABLE_MAP[tableName];
    if (!table) {
      throw new Error(`Unknown table: ${tableName}`);
    }
    return db.delete(table);
  });

  await db.batch(deleteQueries as [any, ...any[]]);
};