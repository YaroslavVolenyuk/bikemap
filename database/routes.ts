import { cache } from 'react';
import type { Route } from '../migrations/1687943012-createRoutes';
import { sql } from './connect';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

export type RoutePayload = {
  name?: string;
  distanceMeters?: number;
  durationMs?: number;
  ascentMeters?: number;
  descentMeters?: number;
  geometry?: JsonValue;
  elevation?: JsonValue;
  surfaces?: JsonValue;
  wayTypes?: JsonValue;
};

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

export const getRouteByRouteId = cache(async (routeId: number, userId: number) => {
  const [route] = await sql<Route[]>`
    SELECT * FROM routes
    WHERE route_id = ${routeId}
      AND user_id = ${userId}
  `;
  return route ?? null;
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

export async function createRoute(
  routeId: number,
  userId: number,
  startpointLat: number,
  startpointLng: number,
  endpointLat: number,
  endpointLng: number,
  payload: RoutePayload = {},
) {
  const [route] = await sql<Route[]>`
      INSERT INTO routes
        (
          route_id,
          user_id,
          startpoint_lat,
          startpoint_lng,
          endpoint_lat,
          endpoint_lng,
          name,
          distance_meters,
          duration_ms,
          ascent_meters,
          descent_meters,
          geometry,
          elevation,
          surfaces,
          way_types
        )
      VALUES
        (
          ${routeId},
          ${userId},
          ${startpointLat},
          ${startpointLng},
          ${endpointLat},
          ${endpointLng},
          ${payload.name ?? null},
          ${payload.distanceMeters ?? null},
          ${payload.durationMs ?? null},
          ${payload.ascentMeters ?? null},
          ${payload.descentMeters ?? null},
          ${payload.geometry === undefined ? null : JSON.stringify(payload.geometry)},
          ${payload.elevation === undefined ? null : JSON.stringify(payload.elevation)},
          ${payload.surfaces === undefined ? null : JSON.stringify(payload.surfaces)},
          ${payload.wayTypes === undefined ? null : JSON.stringify(payload.wayTypes)}
        )
      RETURNING *
    `;

  return route;
}

export async function deleteRouteById(route_id: number) {
  const [routes] = await sql<Route[]>`
    DELETE FROM
      routes
    WHERE
      route_id = ${route_id}
    RETURNING *
  `;
  return routes;
}

export async function deleteAllRoutesByUserId(userId: number) {
  const [routes] = await sql<Route[]>`
    DELETE FROM
      routes
    WHERE
      user_id = ${userId}
    RETURNING *
  `;
  return routes;
}
