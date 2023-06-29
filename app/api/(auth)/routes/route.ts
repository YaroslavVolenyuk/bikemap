import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createRoute,
  getRoutes,
  getRoutesAndPointsById,
} from '../../../../database/routes';
import { getValidSessionByToken } from '../../../../database/sessions';
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
  startpointId: z.number(),
  endpointId: z.number(),
});

const pointsSchema = z.object({
  id: z.number(),
  lat: z.string(),
  lng: z.string(),
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
  // query the database to get all the routes
  const route = await getRoutes(
    result.data.id,
    result.data.routeId,
    result.data.userId,
    result.data.startpointId,
    result.data.endpointId,
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
    route: route,
  });
}

// GET

export async function GET(
  request: NextRequest,
): Promise<NextResponse<RoutesResponseBodyGet>> {
  // const { searchParams } = new URL(request.url);

  // fetch database
  const routes = await getRoutes()
  // const routes = await getRoutesAndPointsById()
  console.log(routes)

// check session?
  const sessionTokenCookie = cookies().get('sessionToken');

  const session =
    sessionTokenCookie &&
    (await getValidSessionByToken(sessionTokenCookie.value));

  console.log('This comes from the API', session);

  if (!session) {
    return NextResponse.json(
      {
        error: 'session token is not valid',
      },
      { status: 401 },
    );
  }

  // const limit = Number(searchParams.get('limit'));
  // const offset = Number(searchParams.get('offset'));

  // if (!limit || !offset) {
  //   return NextResponse.json(
  //     {
  //       error: 'Limit and Offset need to be passed as params',
  //     },
  //     { status: 400 },
  //   );
  }

  // query the database to get all the animals only if a valid session token is passed
  // const animals = await getAnimalsWithLimitAndOffsetBySessionToken(
  //   limit,
  //   offset,
  //   sessionTokenCookie.value,
  // );

  // return NextResponse.json({ animals: animals });
}
