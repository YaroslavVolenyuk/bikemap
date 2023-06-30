import { NextResponse } from 'next/server';

export function GET(): NextResponse<{ routes: string }> {
  return NextResponse.json({ routes: '/api/routes' });
}
