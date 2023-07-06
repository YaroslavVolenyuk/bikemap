import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createRoute,
  getRoutes,
  getRoutesAndPointsById,
} from '../../../../database/routes';
import { Route } from '../../../../migrations/1687943012-createRoutes';

// POST

// 1.

export type Error = {
  error: string;
};

type RoutesResponseBodyGet = { routes: Route[] } | Error;
type RoutesResponseBodyPost = { routes: Route } | Error;
// type PointsResponseBodyGet = { ?? : Animal[] } | Error;
// type PointsResponseBodyPost = { ?? : Animal } | Error;

const routesSchema = z.object({
  routeId: z.number(),
  userId: z.number(),
  startpointLat: z.number(),
  startpointLng: z.number(),
  endpointLat: z.number(),
  endpointLng: z.number(),
});

// const pointsSchema = z.object({
//   id: z.number(),
//   lat: z.string(),
//   lng: z.string(),
// });

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RoutesResponseBodyPost>> {
  const body = await request.json();

  const result = routesSchema.safeParse(body);
  console.log('result of routesSchema', result);
  console.log(result.error);

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
    // zod send you details about the error
    // console.log(result.error);
    return NextResponse.json(
      {
        error: 'Error creating the new route',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    route: {
      routeId: result.data.routeId,
      userId: result.data.userId,
      startpointLat: result.data.startpointLat,
      startpointLng: result.data.startpointLng,
      endpointLat: result.data.endpointLat,
      endpointLng: result.data.endpointLng,
    },
  });
}
