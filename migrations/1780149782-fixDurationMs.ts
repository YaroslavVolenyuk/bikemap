import type { Sql } from 'postgres';

export async function up(sql: Sql) {
  await sql`
    ALTER TABLE routes
      ALTER COLUMN duration_ms TYPE bigint
  `;
}

export async function down(sql: Sql) {
  await sql`
    ALTER TABLE routes
      ALTER COLUMN duration_ms TYPE integer
  `;
}
