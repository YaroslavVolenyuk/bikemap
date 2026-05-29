import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession } from '../../../../database/sessions';
import { createUser, getUserByUsername } from '../../../../database/users';
import type { User } from '../../../../migrations/1686743093-createUsers';
import { secureCookieOptions } from '../../../../util/cookies';

type Error = {
  error: string;
};

export type RegisterResponseBodyPost =
  | {
      user: User;
    }
  | Error;

const userSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RegisterResponseBodyPost>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: 'invalid request body',
      },
      { status: 400 },
    );
  }

  // 1. get the credentials from the body
  const result = userSchema.safeParse(body);

  // 2. verify the user data and check that the name is not taken
  if (!result.success) {
    // zod send you details about the error
    // console.log(result.error);
    return NextResponse.json(
      {
        error: 'username or password missing',
      },
      { status: 400 },
    );
  }

  try {
    if (await getUserByUsername(result.data.username)) {
      // zod send you details about the error
      // console.log(result.error);
      return NextResponse.json(
        {
          error: 'username is already used',
        },
        { status: 406 },
      );
    }

    // 3. hash the password
    const passwordHash = await bcrypt.hash(result.data.password, 10);

    // 4. store the credentials in the db
    const newUser = await createUser(result.data.username, passwordHash);

    if (!newUser) {
      // zod send you details about the error
      // console.log(result.error);
      return NextResponse.json(
        {
          error: 'Error creating the new user',
        },
        { status: 500 },
      );
    }

    // We are sure the user is authenticated

    // 5. Create a token
    const token = crypto.randomBytes(100).toString('base64');
    // 6. Create the session record

    const session = await createSession(token, newUser.id);

    if (!session) {
      return NextResponse.json(
        {
          error: 'Error creating the new session',
        },
        { status: 500 },
      );
    }

    // 7. Send the new cookie in the headers
    const response = NextResponse.json(
      { user: newUser },
      {
        status: 201,
      },
    );

    response.cookies.set({
      name: 'sessionToken',
      value: session.token,
      ...secureCookieOptions,
    });

    // 8. return the new user to the client
    return response;
  } catch (error) {
    console.error('Registration failed', error);

    return NextResponse.json(
      {
        error: 'Unable to register right now',
      },
      { status: 500 },
    );
  }
}
