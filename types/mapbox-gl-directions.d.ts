declare module '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions' {
  import type mapboxgl from 'mapbox-gl';

  type Coordinate = [number, number];

  interface DirectionsFeature {
    geometry?: { coordinates?: Coordinate };
  }

  interface DirectionsRouteStep {
    maneuver: { location: Coordinate };
  }

  interface DirectionsRouteLeg {
    steps: DirectionsRouteStep[];
  }

  interface DirectionsRoute {
    distance: number;
    duration: number;
    geometry: { coordinates: Coordinate[] };
    legs: DirectionsRouteLeg[];
  }

  interface DirectionsRouteEvent {
    route?: DirectionsRoute[];
  }

  interface DirectionsFeatureEvent {
    feature?: DirectionsFeature;
  }

  interface DirectionsOptions {
    accessToken: string;
    unit?: string;
    alternatives?: boolean;
    profile?: string;
    steps?: boolean;
    geometries?: string;
    controls?: Record<string, boolean>;
    [key: string]: unknown;
  }

  class MapboxDirections implements mapboxgl.IControl {
    constructor(options: DirectionsOptions);
    on(event: 'route', handler: (e: DirectionsRouteEvent) => void): this;
    on(event: 'origin' | 'destination', handler: (e: DirectionsFeatureEvent) => void): this;
    setOrigin(value: string | Coordinate): this;
    setDestination(value: string | Coordinate): this;
    getOrigin(): DirectionsFeature | null;
    getDestination(): DirectionsFeature | null;
    removeRoutes(): this;
    getWaypoints(): unknown[];
    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(map: mapboxgl.Map): void;
  }

  export default MapboxDirections;
}
