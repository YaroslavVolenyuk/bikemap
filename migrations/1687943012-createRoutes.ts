import type { Sql } from 'postgres';

export type Route = {
  id: number;
  routeId: number;
  userId: number;
  startpointLat: number;
  startpointLng: number;
  endpointLat: number;
  endpointLng: number;
  name?: string | null;
  distanceMeters?: number | null;
  durationMs?: number | null;
  ascentMeters?: number | null;
  descentMeters?: number | null;
  geometry?: unknown;
  elevation?: unknown;
  surfaces?: unknown;
  wayTypes?: unknown;
  createdAt?: Date;
};

export async function up(sql: Sql) {
  await sql`
  CREATE TABLE routes (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    route_id integer NOT NULL UNIQUE,
    user_id integer NOT NULL,
    startpoint_lat DOUBLE PRECISION NOT NULL UNIQUE,
    startpoint_lng DOUBLE PRECISION NOT NULL UNIQUE,
    endpoint_lat DOUBLE PRECISION NOT NULL UNIQUE,
    endpoint_lng DOUBLE PRECISION NOT NULL UNIQUE
  )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE routes;
  `;
}
