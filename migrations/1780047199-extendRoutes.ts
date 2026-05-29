import { Sql } from 'postgres';

export async function up(sql: Sql) {
  await sql`
    ALTER TABLE routes
      DROP CONSTRAINT IF EXISTS routes_startpoint_lat_key,
      DROP CONSTRAINT IF EXISTS routes_startpoint_lng_key,
      DROP CONSTRAINT IF EXISTS routes_endpoint_lat_key,
      DROP CONSTRAINT IF EXISTS routes_endpoint_lng_key
  `;

  await sql`
    ALTER TABLE routes
      ADD COLUMN IF NOT EXISTS name text,
      ADD COLUMN IF NOT EXISTS distance_meters DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS duration_ms integer,
      ADD COLUMN IF NOT EXISTS ascent_meters DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS descent_meters DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS geometry jsonb,
      ADD COLUMN IF NOT EXISTS elevation jsonb,
      ADD COLUMN IF NOT EXISTS surfaces jsonb,
      ADD COLUMN IF NOT EXISTS way_types jsonb,
      ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT now()
  `;
}

export async function down(sql: Sql) {
  await sql`
    ALTER TABLE routes
      DROP COLUMN IF EXISTS name,
      DROP COLUMN IF EXISTS distance_meters,
      DROP COLUMN IF EXISTS duration_ms,
      DROP COLUMN IF EXISTS ascent_meters,
      DROP COLUMN IF EXISTS descent_meters,
      DROP COLUMN IF EXISTS geometry,
      DROP COLUMN IF EXISTS elevation,
      DROP COLUMN IF EXISTS surfaces,
      DROP COLUMN IF EXISTS way_types,
      DROP COLUMN IF EXISTS created_at
  `;
}
