import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createdAt, updatedAt } from '../shared/timestamp.js';

export const HorsepowerEventSourceIds = {
  completeAddAppToFarcaster: 1,
  completeEOnboarding: 2,
  completeGreetColleagues: 3,
  channelBehavior: 4
} as const;

export type HorsepowerEventSourceName = keyof typeof HorsepowerEventSourceIds;

const HORSEPOWER_EVENT_SOURCE_NAMES = Object.keys(HorsepowerEventSourceIds) as [
  HorsepowerEventSourceName,
  ...HorsepowerEventSourceName[]
];

export const horsepowerEventSources = pgTable(
  'horsepower_event_sources',
  {
    id: integer('id').primaryKey(),
    name: text('name', { enum: HORSEPOWER_EVENT_SOURCE_NAMES }).notNull(),
    createdAt,
    updatedAt
  },
  (t) => [
    uniqueIndex('horsepower_event_source_name_unique').on(sql`LOWER(${t.name})`)
  ]
);

export type HorsepowerEventSource = typeof horsepowerEventSources.$inferSelect;
export type NewHorsepowerEventSource =
  typeof horsepowerEventSources.$inferInsert;
