import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteRouteById } from '../../../../database/routes';
import { getUserBySessionToken } from '../../../../database/users';
import { sql } from '../../../../database/connect';

type RouteIdParams = { params: Promise<{ routeId: string }> };

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken');
  if (!sessionToken?.value) return undefined;
  return getUserBySessionToken(sessionToken.value);
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteIdParams,
): Promise<NextResponse> {
  const { routeId } = await params;
  const routeIdNum = Number(routeId);

  if (!Number.isInteger(routeIdNum) || routeIdNum <= 0) {
    return NextResponse.json({ error: 'Invalid route id' }, { status: 400 });
  }

  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const [existing] = await sql<{ userId: number }[]>`
    SELECT user_id FROM routes WHERE route_id = ${routeIdNum}
  `;
  if (!existing) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  if (existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await deleteRouteById(routeIdNum);
  return NextResponse.json({ ok: true });
}

const patchSchema = z.object({
  name: z.string().min(1).max(120),
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteIdParams,
): Promise<NextResponse> {
  const { routeId } = await params;
  const routeIdNum = Number(routeId);

  if (!Number.isInteger(routeIdNum) || routeIdNum <= 0) {
    return NextResponse.json({ error: 'Invalid route id' }, { status: 400 });
  }

  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const [existing] = await sql<{ userId: number }[]>`
    SELECT user_id FROM routes WHERE route_id = ${routeIdNum}
  `;
  if (!existing) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  if (existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [updated] = await sql`
    UPDATE routes SET name = ${result.data.name} WHERE route_id = ${routeIdNum} RETURNING *
  `;
  return NextResponse.json({ route: updated });
}
