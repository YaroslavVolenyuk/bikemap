import { Sql } from 'postgres';

export type Route = {
  id: number;
  routeId: number;
  userId: number;
  startpointId: number;
  endpointId: number;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE routes (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      route_id integer NOT NULL UNIQUE,
      user_id integer NOT NULL,
      startpoint_id integer NOT NULL UNIQUE,
      endpoint_id integer NOT NULL UNIQUE
    )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE routes;
  `;
}
