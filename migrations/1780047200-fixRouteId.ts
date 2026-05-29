import type { Sql } from 'postgres';

export async function up(sql: Sql) {
  await sql`
    ALTER TABLE routes
      DROP COLUMN id,
      ADD PRIMARY KEY (route_id)
  `;
}

export async function down(sql: Sql) {
  await sql`ALTER TABLE routes DROP CONSTRAINT routes_pkey`;
  await sql`
    ALTER TABLE routes
      ADD COLUMN id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  `;
}
