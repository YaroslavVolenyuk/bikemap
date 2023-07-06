import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRoutes } from '../../../../database/routes';
import { getValidSessionByToken } from '../../../../database/sessions';
import { Route } from '../../../../migrations/1687943012-createRoutes';

// GET

export async function GET(
  request: NextRequest,
): Promise<NextResponse<RoutesResponseBodyGet>> {
  // const { searchParams } = new URL(request.url);

  // fetch database
  const routes = await getRoutes();

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

  // // const limit = Number(searchParams.get('limit'));
  // // const offset = Number(searchParams.get('offset'));

  // // if (!limit || !offset) {
  // //   return NextResponse.json(
  // //     {
  // //       error: 'Limit and Offset need to be passed as params',
  // //     },
  // //     { status: 400 },
  // //   );
  // }

  // // query the database to get all the animals only if a valid session token is passed
  // // const animals = await getAnimalsWithLimitAndOffsetBySessionToken(
  // //   limit,
  // //   offset,
  // //   sessionTokenCookie.value,
  // // );

  // return NextResponse.json({ animals: animals });
}
