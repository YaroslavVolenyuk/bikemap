import { cache } from 'react';
import { Point } from '../migrations/1687168505-createPoints';
import { Route } from '../migrations/1687943012-createRoutes';
import { sql } from './connect';

export const getRoutes = cache(async () => {
  const routes = await sql<Route[]>`
    SELECT * FROM routes
 `;

  return routes;
});

// export const getAnimalsWithLimitAndOffset = cache(
//   async (limit: number, offset: number) => {
//     const routes = await sql<Route[]>`
//       SELECT
//         *
//       FROM
//         routes
//       LIMIT ${limit}
//       OFFSET ${offset}
//     `;

//     return routes;
//   },
// );

/*

export const getRoutesAndPointsBySessionToken = cache(
  async (lat: number, lng: number, token: string) => {
    const routes = await sql<Route[]>`
      SELECT
        routes.*
      FROM
        routes
      INNER JOIN
        sessions ON (
          sessions.token = ${token} AND
          sessions.expiry_timestamp > now()
          -- sessions.user_id = animals.user_id
        )
      -- This would JOIN the users table that is related to animals
      -- INNER JOIN
      --   users ON (
      --     users.id = animals.user_id AND
      --     sessions.user_id = users.id
      --   )
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return routes;
  },
);

*/

// какой айди я ищу?

export const getRouteById = cache(async (id: number) => {
  const [route] = await sql<Route[]>`
    SELECT
      *
    FROM
      routes
    WHERE
      route_id = ${id}
  `;
  return route;
});

export const getRouteByUserId = cache(async (id: number) => {
  const [route] = await sql<Route[]>`
    SELECT
      *
    FROM
      routes
    WHERE
      user_id = ${id}
  `;
  return route;
});

export const createRoute = cache(
  async (
    route_id: number,
    user_id: number,
    startpoint_id: number,
    endpoint_id: number,
  ) => {
    const [animal] = await sql<Route[]>`
      INSERT INTO routes
        (route_id, user_id, startpoint_id, endpoint_id)
      VALUES
        (${routeId}, ${user_id}, ${startpoint_id}, ${endpoint_id})
      RETURNING *
    `;

    return animal;
  },
);

// export const updateRouteById = cache(
//   async (id: number, firstName: string, type: string, accessory?: string) => {
//     const [animal] = await sql<Route[]>`
//       UPDATE routes
//       SET
//         first_name = ${firstName},
//         type = ${type},
//         accessory = ${accessory || null}
//       WHERE
//         id = ${id}
//         RETURNING *
//     `;

//     return animal;
//   },
// );

export const deleteRoutelById = cache(async (id: number) => {
  const [routes] = await sql<Route[]>`
    DELETE FROM
      routes
    WHERE
      route_id = ${id}
    RETURNING *
  `;
  return routes;
});

// export const getAnimalsWithFoods = cache(async (id: number) => {
//   const animalFoods = await sql<AnimalFoods[]>`
//    SELECT
//      animals.id AS animal_id,
//      animals.first_name AS animal_first_name,
//      animals.type AS animal_type,
//      animals.accessory AS animal_accessory,
//      foods.id AS food_id,
//      foods.name AS food_name,
//      foods.type AS food_type
//     FROM
//      animals
//     INNER JOIN
//       animal_foods ON animals.id = animal_foods.animal_id
//     INNER JOIN
//       foods ON foods.id = animal_foods.food_id
//     WHERE animals.id = ${id}
//   `;
//   return animalFoods;
// });

// Join query for getting a single animal with related foods using json_agg

//

//

// Route with points by user id?

export const getRoutesAndPointsById = cache(async (id: number) => {
  const [animal] = await sql<AnimalWithFoodsInJsonAgg[]>`
SELECT
  animals.id AS animal_id,
  animals.first_name AS animal_name,
  animals.type AS animal_type,
  animals.accessory AS animal_accessory,
  (
    SELECT
      json_agg(foods.*)
    FROM
      animal_foods
    INNER JOIN
      foods ON animal_foods.food_id = foods.id
    WHERE
      animal_foods.animal_id = animals.id

  ) AS animal_foods
FROM
  animals
WHERE
  animals.id = ${id}
GROUP BY
  animals.first_name, animals.type, animals.accessory, animals.id;
  `;

  return animal;
});
