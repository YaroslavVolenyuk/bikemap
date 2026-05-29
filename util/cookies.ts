import { cookies } from 'next/headers';

export async function getCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export const secureCookieOptions = {
  httpOnly: true,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24,
  // Be explicit about new default behavior
  // in browsers
  // https://web.dev/samesite-cookies-explained/
  sameSite: 'lax', // this prevents CSRF attacks
} as const;
