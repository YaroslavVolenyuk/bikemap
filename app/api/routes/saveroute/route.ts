import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRoute, type RoutePayload } from '../../../../database/routes';
import { getUserBySessionToken } from '../../../../database/users';
import { Route } from '../../../../migrations/1687943012-createRoutes';

export type Error = {
  error: string;
};

type RoutesResponseBodyPost = { routes: Route } | Error;

const routesSchema = z.object({
  routeId: z.number().int().positive().optional(),
  userId: z.number().optional(),
  startpointLat: z.number(),
  startpointLng: z.number(),
  endpointLat: z.number(),
  endpointLng: z.number(),
  name: z.string().optional(),
  distanceMeters: z.number().optional(),
  durationMs: z.number().optional(),
  ascentMeters: z.number().optional(),
  descentMeters: z.number().optional(),
  geometry: z.unknown().optional(),
  elevation: z.unknown().optional(),
  surfaces: z.unknown().optional(),
  wayTypes: z.unknown().optional(),
});

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RoutesResponseBodyPost>> {
  const body = await request.json();

  const result = routesSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'The data is incomplete',
      },
      { status: 400 },
    );
  }

  const sessionToken = cookies().get('sessionToken');
  const user = !sessionToken?.value
    ? undefined
    : await getUserBySessionToken(sessionToken.value);

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const routeId = result.data.routeId || crypto.randomInt(1, 2147483647);
  const payload: RoutePayload = {
    name: result.data.name,
    distanceMeters: result.data.distanceMeters,
    durationMs: result.data.durationMs,
    ascentMeters: result.data.ascentMeters,
    descentMeters: result.data.descentMeters,
    geometry: result.data.geometry as RoutePayload['geometry'],
    elevation: result.data.elevation as RoutePayload['elevation'],
    surfaces: result.data.surfaces as RoutePayload['surfaces'],
    wayTypes: result.data.wayTypes as RoutePayload['wayTypes'],
  };

  const route = await createRoute(
    routeId,
    user.id,
    result.data.startpointLat,
    result.data.startpointLng,
    result.data.endpointLat,
    result.data.endpointLng,
    payload,
  );

  if (!route) {
    return NextResponse.json(
      {
        error: 'Error creating the new route',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    routes: route,
  });
}
