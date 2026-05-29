import type { Coordinate, ElevationPoint } from '../app/map/routeDetails';

export type ParsedGpx = {
  name: string;
  coordinates: Coordinate[];
  elevation: ElevationPoint[];
};

export function parseGpxString(xml: string): ParsedGpx {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const nameEl = doc.querySelector('trk > name') ?? doc.querySelector('metadata > name');
  const name = (nameEl?.textContent ?? '').trim() || 'Imported route';

  const trkpts = Array.from(doc.querySelectorAll('trkpt'));

  const rawPoints = trkpts.map((pt) => {
    const lat = Number(pt.getAttribute('lat'));
    const lon = Number(pt.getAttribute('lon'));
    const eleText = pt.querySelector('ele')?.textContent;
    const ele = eleText != null ? Number(eleText) : null;
    return { lat, lon, ele };
  }).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

  const coordinates: Coordinate[] = rawPoints.map((p) => [p.lon, p.lat]);

  let cumulativeDistance = 0;
  const elevation: ElevationPoint[] = [];

  for (let i = 0; i < rawPoints.length; i++) {
    if (i > 0) {
      const prev = rawPoints[i - 1]!;
      const curr = rawPoints[i]!;
      cumulativeDistance += haversineMeters(prev.lat, prev.lon, curr.lat, curr.lon);
    }
    const curr = rawPoints[i]!;
    if (curr.ele !== null && Number.isFinite(curr.ele)) {
      elevation.push({ distanceMeters: cumulativeDistance, elevationMeters: curr.ele });
    }
  }

  return { name, coordinates, elevation };
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
