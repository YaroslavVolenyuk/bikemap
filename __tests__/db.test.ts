import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../database/connect', () => ({
  sql: Object.assign(jest.fn(), { json: jest.fn((v: unknown) => v) }),
}));
jest.mock('react', () => ({ ...jest.requireActual('react'), cache: (fn: unknown) => fn }));

import { sql } from '../database/connect';
import { createRoute, getRouteByRouteId } from '../database/routes';

const mockSql = sql as jest.MockedFunction<() => Promise<unknown[]>>;

describe('getRouteByRouteId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns route when routeId and userId both match', async () => {
    const row = { routeId: 1, userId: 42, startpointLat: 48, startpointLng: 13, endpointLat: 49, endpointLng: 14 };
    mockSql.mockResolvedValue([row]);

    const result = await getRouteByRouteId(1, 42);
    expect(result).toEqual(row);
  });

  it('returns null when SQL returns no rows (wrong userId blocked in WHERE clause)', async () => {
    mockSql.mockResolvedValue([]);

    const result = await getRouteByRouteId(1, 99);
    expect(result).toBeNull();
  });
});

describe('createRoute', () => {
  it('returns the newly inserted route', async () => {
    const row = { routeId: 7, userId: 1, startpointLat: 48, startpointLng: 13, endpointLat: 49, endpointLng: 14, name: 'Test' };
    mockSql.mockResolvedValue([row]);

    const result = await createRoute(7, 1, 48, 13, 49, 14, { name: 'Test' });
    expect(result).toEqual(row);
  });
});
