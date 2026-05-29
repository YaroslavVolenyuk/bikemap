import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn().mockReturnValue(new Headers()),
}));
jest.mock('../database/connect', () => ({
  sql: Object.assign(jest.fn(), { json: jest.fn((v: unknown) => v) }),
}));
jest.mock('../database/users', () => ({
  getUserBySessionToken: jest.fn(),
  getUserWithPasswordHashByUsername: jest.fn(),
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
}));
jest.mock('../database/routes', () => ({
  createRoute: jest.fn(),
  deleteRouteById: jest.fn(),
  getRoutes: jest.fn(),
  getRouteByUserId: jest.fn(),
  getRouteByRouteId: jest.fn(),
  getAllRouteIdByUserId: jest.fn(),
  deleteAllRoutesByUserId: jest.fn(),
}));
jest.mock('../util/cookies', () => ({
  secureCookieOptions: { httpOnly: true, path: '/', sameSite: 'lax' },
  getCookie: jest.fn(),
}));

import { cookies } from 'next/headers';
import { DELETE as deleteRoute } from '../app/api/routes/[routeId]/route';
import { POST as saveRoute } from '../app/api/routes/saveroute/route';
import { sql } from '../database/connect';
import { getUserBySessionToken } from '../database/users';

const mockCookies = cookies as jest.Mock;
const mockSql = sql as jest.MockedFunction<() => Promise<unknown[]>>;
const mockGetUser = getUserBySessionToken as jest.Mock;

function noCookie() {
  mockCookies.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) });
}
function withCookie(token = 'session-token') {
  mockCookies.mockResolvedValue({ get: jest.fn().mockReturnValue({ value: token }) });
}

describe('POST /api/routes/saveroute', () => {
  it('returns 401 when no session cookie', async () => {
    noCookie();

    const req = new Request('http://localhost/api/routes/saveroute', {
      method: 'POST',
      body: JSON.stringify({ startpointLat: 48.3, startpointLng: 10.5, endpointLat: 49.0, endpointLng: 11.0 }),
      headers: { 'Content-Type': 'application/json' },
    }) as any;

    const res = await saveRoute(req);
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/routes/[routeId]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    noCookie();

    const req = new Request('http://localhost/api/routes/42', { method: 'DELETE' }) as any;
    const res = await deleteRoute(req, { params: Promise.resolve({ routeId: '42' }) });
    expect(res.status).toBe(401);
  });

  it('returns 403 when route belongs to a different user', async () => {
    withCookie();
    mockGetUser.mockResolvedValue({ id: 1, username: 'alice' });
    mockSql.mockResolvedValue([{ userId: 2 }]);

    const req = new Request('http://localhost/api/routes/42', { method: 'DELETE' }) as any;
    const res = await deleteRoute(req, { params: Promise.resolve({ routeId: '42' }) });
    expect(res.status).toBe(403);
  });
});
