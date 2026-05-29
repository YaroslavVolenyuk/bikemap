import type { Coordinate, ElevationPoint } from '../app/map/routeDetails';

export function buildGpxString(
  name: string,
  geometry: Coordinate[],
  elevation: ElevationPoint[],
  createdAt?: string,
): string {
  const safeName = name.replace(/[<>&"]/g, '');
  const trkpts = geometry
    .map((coord, i) => {
      const elevPoint = elevation[i];
      const ele = elevPoint ? `<ele>${elevPoint.elevationMeters.toFixed(1)}</ele>` : '';
      const time = createdAt ? `<time>${new Date(createdAt).toISOString()}</time>` : '';
      return `      <trkpt lat="${coord[1]}" lon="${coord[0]}">${ele}${time}</trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="bikemap" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${safeName}</name></metadata>
  <trk>
    <name>${safeName}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}
