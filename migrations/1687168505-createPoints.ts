// import { Sql } from 'postgres';

// export type Point = {
//   id: number;
//   lat: string;
//   lng: string;
// };

// export async function up(sql: Sql) {
//   await sql`
//     CREATE TABLE points (
//    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
//       route_id INT,
//       lat varchar(20) NOT NULL UNIQUE,
//       lng varchar(20) NOT NULL UNIQUE
//     )
//   `;
// }

// export async function down(sql: Sql) {
//   await sql`
//     DROP TABLE points;
//   `;
// }
