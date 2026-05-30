import type { Coordinate } from '../app/map/routeDetails';

export async function mapMatchCoordinates(
  coordinates: Coordinate[],
  accessToken: string,
  profile: 'cycling' | 'walking' | 'driving' = 'cycling',
): Promise<Coordinate[] | null> {
  if (coordinates.length < 2) return null;

  // Map Matching API allows max 100 waypoints
  const step = Math.max(1, Math.floor(coordinates.length / 100));
  const sampled = coordinates.filter((coord, i) => i % step === 0 || i === coordinates.length - 1);

  const coordStr = sampled.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const radiuses = sampled.map(() => '25').join(';');
  const url = `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordStr}?geometries=geojson&radiuses=${radiuses}&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data: { matchings?: { geometry: { coordinates: Coordinate[] } }[] } = await response.json();
  return data.matchings?.[0]?.geometry.coordinates ?? null;
}
