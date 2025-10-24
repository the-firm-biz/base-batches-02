import type { NotNull } from 'drizzle-orm';
import { timestamp, type PgTimestampBuilderInitial } from 'drizzle-orm/pg-core';

export const createdAt = timestamp('created_at', {
  mode: 'date',
  precision: 3
})
  .defaultNow()
  .notNull();

export const updatedAt = timestamp('updated_at', {
  mode: 'date',
  precision: 3
}).$onUpdate(() => new Date());

export function pgTimestamp(
  name: string,
  nullable: false
): NotNull<PgTimestampBuilderInitial<string>>;
export function pgTimestamp(
  name: string,
  nullable: true
): PgTimestampBuilderInitial<string>;
export function pgTimestamp(
  name: string,
  nullable?: boolean
):
  | NotNull<PgTimestampBuilderInitial<string>>
  | PgTimestampBuilderInitial<string> {
  let ts = timestamp(name, {
    mode: 'date',
    precision: 3
  });

  if (!nullable) {
    ts = ts.notNull();
  }

  return ts;
}
