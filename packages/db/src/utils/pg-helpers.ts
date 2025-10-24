import { type AnyPgColumn } from 'drizzle-orm/pg-core';
import { sql, type SQL } from 'drizzle-orm';

export function lower(column: AnyPgColumn): SQL {
  return sql`lower(${column})`;
}

/** Case-insensitive equality for strings */
export function lowerEq(column: AnyPgColumn, value: string): SQL {
  return sql`lower(${column}) = ${value.toLowerCase()}`;
}

export function lowerInArray(column: AnyPgColumn, values: string[]): SQL {
  if (values.length === 0) {
    // Do not attempt to construct SQL with empty array since "... IN ()" is invalid SQL syntax
    // Return a condition that always evaluates to false
    return sql`1 = 0`;
  }

  return sql`lower(${column}) IN (${sql.join(
    values.map((value) => sql`${value.toLowerCase()}`),
    sql`, `
  )})`;
}
