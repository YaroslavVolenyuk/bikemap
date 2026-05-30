export type Coordinate = [number, number];

export type MapboxRoute = {
  distanceMeters?: number;
  durationSeconds?: number;
  geometry?: {
    coordinates?: Coordinate[];
  };
};

export type RouteBreakdownItem = {
  name: string;
  distanceMeters: number;
  percent: number;
  color?: string;
};

export type ElevationPoint = {
  distanceMeters: number;
  elevationMeters: number;
};

export type Instruction = {
  sign: number;
  text: string;
  distanceMeters: number;
  pointIndex: number;
};

export type RouteDetails = {
  distanceMeters: number;
  durationMs: number;
  ascentMeters: number;
  descentMeters: number;
  highestMeters?: number;
  lowestMeters?: number;
  elevation: ElevationPoint[];
  surfaces: RouteBreakdownItem[];
  wayTypes: RouteBreakdownItem[];
  geometry: Coordinate[];
  instructions: Instruction[];
};

type GraphhopperDetail = [number, number, string];

type GraphhopperInstruction = {
  sign: number;
  text: string;
  distance: number;
  interval: [number, number];
};

type GraphhopperPath = {
  distance: number;
  time: number;
  ascend?: number;
  descend?: number;
  points?: {
    coordinates?: Array<[number, number, number?]>;
  };
  details?: {
    surface?: GraphhopperDetail[];
    road_class?: GraphhopperDetail[];
  };
  instructions?: GraphhopperInstruction[];
};

type GraphhopperResponse = {
  paths?: GraphhopperPath[];
};

const wayTypeColors = [
  '#1f5fd6',
  '#4d8bf0',
  '#86b4f7',
  '#16386f',
  '#b9d4fb',
  '#6d8ecf',
];

const surfaceLabels: Record<string, string> = {
  asphalt: 'Asphalt',
  concrete: 'Concrete',
  paved: 'Paved',
  paving_stones: 'Paving stones',
  cobblestone: 'Cobblestone',
  fine_gravel: 'Fine gravel',
  gravel: 'Gravel',
  dirt: 'Dirt',
  ground: 'Ground',
  grass: 'Grass',
  missing: 'Unknown',
};

const roadClassLabels: Record<string, string> = {
  cycleway: 'Cycleway',
  path: 'Path',
  footway: 'Footpath',
  residential: 'Street',
  service: 'Service road',
  tertiary: 'Road',
  secondary: 'Road',
  primary: 'Main road',
  track: 'Track',
  road: 'Road',
  missing: 'Unknown',
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceBetweenMeters(a: Coordinate, b: Coordinate) {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(b[1] - a[1]);
  const deltaLng = toRadians(b[0] - a[0]);
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

export function getCumulativeDistances(coordinates: Coordinate[]) {
  return coordinates.reduce<number[]>((distances, coordinate, index) => {
    if (index === 0) {
      distances.push(0);
      return distances;
    }

    const previousCoordinate = coordinates[index - 1];
    const previousDistance = distances[index - 1] || 0;

    if (!previousCoordinate) return distances;

    distances.push(previousDistance + distanceBetweenMeters(previousCoordinate, coordinate));
    return distances;
  }, []);
}

function getBreakdown(
  details: GraphhopperDetail[] | undefined,
  cumulativeDistances: number[],
  totalDistanceMeters: number,
  labelMap: Record<string, string>,
  colors?: string[],
) {
  if (!details || details.length === 0 || cumulativeDistances.length === 0) {
    return [];
  }

  const grouped = new Map<string, number>();

  details.forEach(([fromIndex, toIndex, rawName]) => {
    if (rawName === 'missing') return;

    const from = cumulativeDistances[fromIndex] || 0;
    const to = cumulativeDistances[toIndex] || from;
    const segmentDistance = Math.max(to - from, 0);
    const name = labelMap[rawName] || rawName.replaceAll('_', ' ');

    grouped.set(name, (grouped.get(name) || 0) + segmentDistance);
  });

  return Array.from(grouped.entries())
    .map(([name, distanceMeters], index) => ({
      name,
      distanceMeters,
      percent: totalDistanceMeters ? (distanceMeters / totalDistanceMeters) * 100 : 0,
      color: colors?.[index % colors.length],
    }))
    .sort((a, b) => b.distanceMeters - a.distanceMeters);
}

export function createRouteDetails(data: GraphhopperResponse): RouteDetails | undefined {
  const path = data.paths?.[0];
  const rawCoordinates = path?.points?.coordinates;

  if (!path || !rawCoordinates || rawCoordinates.length === 0) return undefined;

  const geometry = rawCoordinates.map(([lng, lat]) => [lng, lat] as Coordinate);
  const cumulativeDistances = getCumulativeDistances(geometry);
  const elevation = rawCoordinates
    .map(([, , elevationMeters], index) => ({
      distanceMeters: cumulativeDistances[index] || 0,
      elevationMeters,
    }))
    .filter((point): point is ElevationPoint => typeof point.elevationMeters === 'number');

  const elevationValues = elevation.map((point) => point.elevationMeters);
  const totalDistanceMeters = path.distance || cumulativeDistances.at(-1) || 0;

  const instructions: Instruction[] = (path.instructions ?? []).map((inst) => ({
    sign: inst.sign,
    text: inst.text,
    distanceMeters: inst.distance,
    pointIndex: inst.interval[0],
  }));

  return {
    distanceMeters: totalDistanceMeters,
    durationMs: path.time,
    ascentMeters: path.ascend || 0,
    descentMeters: path.descend || 0,
    highestMeters: elevationValues.length ? Math.max(...elevationValues) : undefined,
    lowestMeters: elevationValues.length ? Math.min(...elevationValues) : undefined,
    elevation,
    surfaces: getBreakdown(
      path.details?.surface,
      cumulativeDistances,
      totalDistanceMeters,
      surfaceLabels,
    ),
    wayTypes: getBreakdown(
      path.details?.road_class,
      cumulativeDistances,
      totalDistanceMeters,
      roadClassLabels,
      wayTypeColors,
    ),
    geometry,
    instructions,
  };
}

export function getFallbackRouteDetails(route?: MapboxRoute) {
  if (!route?.distanceMeters || !route.durationSeconds) return undefined;

  return {
    distanceMeters: route.distanceMeters,
    durationMs: route.durationSeconds * 1000,
  };
}
