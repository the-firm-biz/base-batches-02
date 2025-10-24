import {
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
  check
} from 'drizzle-orm/pg-core';
import { horsepowerEventSources } from './horsepower-event-sources.js';
import { createdAt, updatedAt } from '../shared/timestamp.js';
import { horsePowerRecipientAccountTypes } from './horsepower-recipient-account-types.js';
import { sql } from 'drizzle-orm';

export const horsepowerEvents = pgTable(
  'horsepower_events',
  {
    id: serial('id').primaryKey(),
    /** Why the horsepower event was awarded */
    horsepowerEventSourceId: integer('horsepower_event_source_id')
      .notNull()
      .references(() => horsepowerEventSources.id),
    /** Recipient account type - either Farcaster or Wallet */
    recipientAccountTypeId: integer('recipient_account_type_id')
      .notNull()
      .references(() => horsePowerRecipientAccountTypes.id),
    /** The DB account id that the horsepower event was awarded to */
    recipientAccountId: text('recipient_account_id'),
    /** The amount of horsepower awarded. Can be negative */
    horsePowerAwarded: integer('horse_power_awarded').notNull(),
    /**
     * newHorsePowerTotal is managed by the trigger - trg_calculate_horsepower_running_total.
     * This row can be used to give you the horsepower for a recipientAccountId at any point in time.
     * notNull is used to maintain data integrity (this value WILL always be a number)
     */
    newHorsePowerTotal: integer('new_horse_power_total').notNull().default(0),
    /** Hash of the cast where the HP was awarded. Required for event source 4 (channelBehavior), nullable for others */
    castHash: text('cast_hash'),
    createdAt,
    updatedAt
  },
  (table) => [
    // Partial unique index:
    // only one event per recipientAccountId for event sources 1, 2, and 3 (completeAddAppToFarcaster, completeEOnboarding, and completeGreetColleagues)
    uniqueIndex('unique_one_time_events_per_account')
      .on(table.recipientAccountId, table.horsepowerEventSourceId)
      .where(sql`${table.horsepowerEventSourceId} IN (1, 2, 3)`),
    // each hp recipient can only be awarded for one castHash when event source is 4 (channelBehavior)
    uniqueIndex('unique_one_time_events_per_cast_hash')
      .on(table.recipientAccountId, table.castHash)
      .where(sql`${table.horsepowerEventSourceId} IN (4)`),
    // CHECK constraint: castHash must be provided when horsepowerEventSourceId is 4
    check('cast_hash_required_for_channel_behavior', 
      sql`${table.horsepowerEventSourceId} != 4 OR ${table.castHash} IS NOT NULL`)
  ]
);

export type HorsepowerEvent = typeof horsepowerEvents.$inferSelect;
export type NewHorsepowerEvent = typeof horsepowerEvents.$inferInsert;
