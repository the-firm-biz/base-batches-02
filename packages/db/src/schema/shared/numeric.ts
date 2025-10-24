import type { NotNull } from 'drizzle-orm';
import {
  numeric,
  type PgNumericBigIntBuilderInitial
} from 'drizzle-orm/pg-core';

export function pgWei(
  name: string,
  nullable: false
): NotNull<PgNumericBigIntBuilderInitial<string>>;
export function pgWei(
  name: string,
  nullable: true
): PgNumericBigIntBuilderInitial<string>;
export function pgWei(
  name: string,
  nullable?: boolean
):
  | NotNull<PgNumericBigIntBuilderInitial<string>>
  | PgNumericBigIntBuilderInitial<string> {
  let nm = numeric(name, {
    mode: 'bigint',
    precision: 78,
    scale: 0
  });

  if (!nullable) {
    nm = nm.notNull();
  }

  return nm;
}
