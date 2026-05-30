import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../database/connect', () => ({
  sql: Object.assign(jest.fn(), { json: jest.fn((v: unknown) => v) }),
}));
jest.mock('../util/cookies', () => ({
  secureCookieOptions: { httpOnly: true, path: '/', sameSite: 'lax' },
  getCookie: jest.fn(),
}));
jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock('../database/users', () => ({
  getUserWithPasswordHashByUsername: jest.fn(),
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  getUserBySessionToken: jest.fn(),
}));
jest.mock('../database/sessions', () => ({
  createSession: jest.fn(),
  deleteExpiredSessions: jest.fn(),
  deleteSessionByToken: jest.fn(),
}));

import bcrypt from 'bcrypt';
import { POST as loginPost } from '../app/api/(auth)/login/route';
import { POST as registerPost } from '../app/api/(auth)/register/route';
import { createSession } from '../database/sessions';
import { createUser, getUserByUsername, getUserWithPasswordHashByUsername } from '../database/users';

type SimpleAsyncMock<T> = {
  mockResolvedValue(value: T): unknown;
  mockClear(): unknown;
};

const mockCompare = bcrypt.compare as unknown as SimpleAsyncMock<boolean>;
const mockHash = bcrypt.hash as unknown as SimpleAsyncMock<string>;
const mockCreateSession = createSession as unknown as SimpleAsyncMock<{
  id: number;
  token: string;
  userId: number;
}>;
const mockCreateUser = createUser as unknown as SimpleAsyncMock<{
  id: number;
  username: string;
}>;
const mockGetUserByUsername = getUserByUsername as unknown as SimpleAsyncMock<
  { id: number; username: string } | undefined
>;
const mockGetUserWithPasswordHashByUsername =
  getUserWithPasswordHashByUsername as unknown as SimpleAsyncMock<
    { id: number; username: string; passwordHash: string } | undefined
  >;

function makeRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as any;
}

describe('POST /api/(auth)/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with user on valid credentials', async () => {
    mockGetUserWithPasswordHashByUsername.mockResolvedValue({
      id: 1,
      username: 'alice',
      passwordHash: '$2b$10$hash',
    });
    mockCompare.mockResolvedValue(true);
    mockCreateSession.mockResolvedValue({ id: 1, token: 'tok-abc', userId: 1 });

    const res = await loginPost(makeRequest('http://localhost/api/login', { username: 'alice', password: 'password123' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user: { username: string } };
    expect(body.user.username).toBe('alice');
  });

  it('returns 401 when password is wrong', async () => {
    mockGetUserWithPasswordHashByUsername.mockResolvedValue({
      id: 1,
      username: 'alice',
      passwordHash: '$2b$10$hash',
    });
    mockCompare.mockResolvedValue(false);

    const res = await loginPost(makeRequest('http://localhost/api/login', { username: 'alice', password: 'wrongpass' }));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/(auth)/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 406 when username already taken', async () => {
    mockGetUserByUsername.mockResolvedValue({ id: 1, username: 'alice' });

    const res = await registerPost(makeRequest('http://localhost/api/register', { username: 'alice', password: 'validpassword' }));
    expect(res.status).toBe(406);
  });

  it('returns 201 on successful registration', async () => {
    mockGetUserByUsername.mockResolvedValue(undefined);
    mockHash.mockResolvedValue('$2b$10$hashed');
    mockCreateUser.mockResolvedValue({ id: 2, username: 'bob' });
    mockCreateSession.mockResolvedValue({ id: 1, token: 'tok-xyz', userId: 2 });

    const res = await registerPost(makeRequest('http://localhost/api/register', { username: 'bob', password: 'validpassword' }));
    expect(res.status).toBe(201);
  });
});
