import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ghProfiles: Record<string, string> = {
  road: 'racingbike',
  touring: 'bike',
  gravel: 'bike',
  mtb: 'mtb',
};

const routeDetailsSchema = z.object({
  startLng: z.coerce.number(),
  startLat: z.coerce.number(),
  endLng: z.coerce.number(),
  endLat: z.coerce.number(),
  profile: z.enum(['road', 'touring', 'gravel', 'mtb']).optional().default('touring'),
});

type RouteDetailsResponseBodyGet =
  | {
      paths?: unknown[];
    }
  | {
      error: string;
    };

export async function GET(
  request: NextRequest,
): Promise<NextResponse<RouteDetailsResponseBodyGet>> {
  const result = routeDetailsSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid route coordinates' }, { status: 400 });
  }

  // Read API key from environment. Do NOT keep fallback secrets in source code.
  const apiKey = process.env.GRAPHHOPPER_API_KEY;

  if (!apiKey) {
    // Fail fast and clearly when the key is not provided so we don't keep secrets in code.
    return NextResponse.json({ error: 'Missing GraphHopper API key (set GRAPHHOPPER_API_KEY)' }, { status: 500 });
  }
  const url = new URL('https://graphhopper.com/api/1/route');

  url.searchParams.append('point', `${result.data.startLat},${result.data.startLng}`);
  url.searchParams.append('point', `${result.data.endLat},${result.data.endLng}`);
  url.searchParams.set('profile', ghProfiles[result.data.profile] ?? 'bike');
  url.searchParams.set('points_encoded', 'false');
  url.searchParams.append('details', 'road_class');
  url.searchParams.append('details', 'surface');
  url.searchParams.set('locale', 'en');
  url.searchParams.set('elevation', 'true');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'GraphHopper route details failed' },
      { status: response.status },
    );
  }

  return NextResponse.json((await response.json()) as RouteDetailsResponseBodyGet);
}
