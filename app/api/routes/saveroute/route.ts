import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRoute } from '../../../../database/routes';
import { Route } from '../../../../migrations/1687943012-createRoutes';

export type Error = {
  error: string;
};

type RoutesResponseBodyPost = { routes: Route } | Error;

const routesSchema = z.object({
  routeId: z.number(),
  userId: z.number(),
  startpointLat: z.number(),
  startpointLng: z.number(),
  endpointLat: z.number(),
  endpointLng: z.number(),
});

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RoutesResponseBodyPost>> {
  const body = await request.json();

  const result = routesSchema.safeParse(body);
  console.log('result of routesSchema', result);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'The data is incomplete',
      },
      { status: 400 },
    );
  }
  // query the database t§o get all the routes
  const route = await createRoute(
    result.data.routeId,
    result.data.userId,
    result.data.startpointLat,
    result.data.startpointLng,
    result.data.endpointLat,
    result.data.endpointLng,
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
