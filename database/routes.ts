import { cache } from 'react';
import { Route } from '../migrations/1687943012-createRoutes';
import { sql } from './connect';

export const getRoutes = cache(async () => {
  const routes = await sql<Route[]>`
    SELECT * FROM routes
 `;

  return routes;
});

export const getRouteByUserId = cache(async (userId: number) => {
  const route = await sql<Route[]>`
    SELECT
      *
    FROM routes
    WHERE user_id = ${userId}
  `;
  return route;
});

export const getAllRouteIdByUserId = cache(async (userId: number) => {
  const route = await sql<{ routeId: number }[]>`
    SELECT route_id
    FROM
      routes
    WHERE
      user_id = ${userId}
  `;
  return route;
});

export const createRoute = cache(
  async (
    routeId: number,
    userId: number,
    startpointLat: number,
    startpointLng: number,
    endpointLat: number,
    endpointLng: number,
  ) => {
    const [route] = await sql<Route[]>`
      INSERT INTO routes
        (route_id, user_id, startpoint_lat, startpoint_lng, endpoint_lat, endpoint_lng)
      VALUES
        (${routeId}, ${userId}, ${startpointLat}, ${startpointLng}, ${endpointLat}, ${endpointLng})
      RETURNING *
    `;

    return route;
  },
);

export const deleteRouteById = cache(async (route_id: number) => {
  const [routes] = await sql<Route[]>`
    DELETE FROM
      routes
    WHERE
      route_id = ${route_id}
    RETURNING *
  `;
  return routes;
});

export const deleteAllRoutesByUserId = cache(async (userId: number) => {
  const [routes] = await sql<Route[]>`
    DELETE FROM
      routes
    WHERE
      user_id = ${userId}
    RETURNING *
  `;
  return routes;
});
