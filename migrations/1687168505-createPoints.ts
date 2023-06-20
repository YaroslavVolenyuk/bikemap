import { Sql } from 'postgres';

export type Point = {
  id: number;
  lat: string;
  lng: string;
  route_id: number;
  index: number;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE points (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      lat varchar(20) NOT NULL UNIQUE,
      lng varchar(20) NOT NULL,
route_id integer NOT NULL,
index integer NOT NULL
    )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE points;
  `;
}
