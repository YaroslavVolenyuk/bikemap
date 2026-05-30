import type { Coordinate } from '../app/map/routeDetails';

const MAX_COORDS = 100;

async function matchChunk(
  coords: Coordinate[],
  profile: string,
  accessToken: string,
): Promise<Coordinate[] | null> {
  const coordStr = coords.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const radiuses = coords.map(() => '25').join(';');
  const url = `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordStr}?geometries=geojson&radiuses=${radiuses}&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data: { matchings?: { geometry: { coordinates: Coordinate[] } }[] } =
    await response.json();
  return data.matchings?.[0]?.geometry.coordinates ?? null;
}

export async function mapMatchCoordinates(
  coordinates: Coordinate[],
  accessToken: string,
  profile: 'cycling' | 'walking' | 'driving' = 'cycling',
): Promise<Coordinate[] | null> {
  if (coordinates.length < 2) return null;

  // If small enough, send directly
  if (coordinates.length <= MAX_COORDS) {
    return matchChunk(coordinates, profile, accessToken);
  }

  // Split into chunks of MAX_COORDS with 1-point overlap for continuity
  const result: Coordinate[] = [];
  let i = 0;

  while (i < coordinates.length) {
    const chunk = coordinates.slice(i, i + MAX_COORDS);
    const matched = await matchChunk(chunk, profile, accessToken);

    if (!matched) return null;

    // Skip first point of subsequent chunks (overlap duplicate)
    if (result.length === 0) {
      result.push(...matched);
    } else {
      result.push(...matched.slice(1));
    }

    // Advance by MAX_COORDS - 1 so last point of chunk = first of next
    i += MAX_COORDS - 1;
  }

  return result;
}
