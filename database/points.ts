import { cache } from 'react';
import { Point } from '../migrations/1687168505-createPoints';
import { sql } from './connect';

export const getPoints = cache(async () => {
  const points = await sql<Point[]>`
    SELECT * FROM points
 `;

  return points;
});

// export const getAnimalsWithLimitAndOffset = cache(
//   async (limit: number, offset: number) => {
//     const animals = await sql<Point[]>`
//       SELECT
//         *
//       FROM
//         animals
//       LIMIT ${limit}
//       OFFSET ${offset}
//     `;

//     return animals;
//   },
// );

// export const getAnimalsWithLimitAndOffsetBySessionToken = cache(
//   async (limit: number, offset: number, token: string) => {
//     const animals = await sql<Animal[]>`
//       SELECT
//         animals.*
//       FROM
//         animals
//       INNER JOIN
//         sessions ON (
//           sessions.token = ${token} AND
//           sessions.expiry_timestamp > now()
//           -- sessions.user_id = animals.user_id
//         )
//       -- This would JOIN the users table that is related to animals
//       -- INNER JOIN
//       --   users ON (
//       --     users.id = animals.user_id AND
//       --     sessions.user_id = users.id
//       --   )
//       LIMIT ${limit}
//       OFFSET ${offset}
//     `;

//     return animals;
//   },
// );

export const getPointsById = cache(async (routeId: number) => {
  const [point] = await sql<Point[]>`
    SELECT
      *
    FROM
      points
    WHERE
    route_id = ${routeId}
  `;
  return point;
});

export const createPoint = cache(
  async (routeId: number, lat: string, lng: string) => {
    const [point] = await sql<Point[]>`
      INSERT INTO points
        (route_id, lat, lng)
      VALUES
        (${routeId}, ${lat}, ${lng})
      RETURNING *
    `;

    return point;
  },
);

// export const updateAnimalById = cache(async (lat: string, lng: string) => {
//   const [animal] = await sql<Animal[]>`
//       UPDATE animals
//       SET
//         first_name = ${lat},
//         type = ${type},
//         accessory = ${accessory || null}
//       WHERE
//         id = ${id}
//         RETURNING *
//     `;

//   return animal;
// });

export const deleteAnimalById = cache(async (id: number) => {
  const [animal] = await sql<Point[]>`
    DELETE FROM
      animals
    WHERE
      id = ${id}
    RETURNING *
  `;
  return animal;
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
export const getAnimalWithFoodsById = cache(async (id: number) => {
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
