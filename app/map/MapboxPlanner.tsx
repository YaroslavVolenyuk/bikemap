'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import '../index.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import type { Coordinate, MapboxRoute } from './routeDetails';
import type { ParsedGpx } from '../../util/parseGpx';

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

mapboxgl.accessToken = mapboxAccessToken ?? '';

type RoutePoints = {
  start: Coordinate;
  destination: Coordinate;
};

export type PlannerRouteChange = RoutePoints & {
  mapboxRoute: MapboxRoute;
};

export type MapControls = {
  clearRoute: () => void;
  reverseRoute: () => void;
  toggleTerrain: () => boolean;
};

type Props = {
  onRouteChange: (route: PlannerRouteChange) => void;
  onControlsReady?: (controls: MapControls) => void;
  importedTrack?: ParsedGpx | null;
};

type DirectionsRoute = {
  distance: number;
  duration: number;
  geometry: { coordinates: Coordinate[] };
  legs: Array<{
    steps: Array<{
      maneuver: { location: Coordinate };
    }>;
  }>;
};

function getRouteEndpoint(
  route: DirectionsRoute,
  side: 'start' | 'destination',
): Coordinate | undefined {
  const legs = route?.legs ?? [];
  const leg = side === 'start' ? legs[0] : legs[legs.length - 1];
  const steps = leg?.steps ?? [];
  const step = side === 'start' ? steps[0] : steps[steps.length - 1];
  return step?.maneuver?.location;
}

function formatCoordinates(coordinates: Coordinate | undefined): string {
  if (!coordinates) return '';
  const [lng, lat] = coordinates;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function isGeneratedCoordinateValue(value: string): boolean {
  return (
    value.startsWith('Current location') ||
    /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(value)
  );
}

function setDirectionsInputValue(
  type: 'origin' | 'destination',
  coordinates: Coordinate | undefined,
  options: { force?: boolean; prefix?: string } = {},
) {
  const containerClass =
    type === 'origin' ? 'mapbox-directions-origin' : 'mapbox-directions-destination';
  const container = document.getElementsByClassName(containerClass)[0];
  const input = container?.getElementsByTagName('input')[0];

  if (!input || !coordinates) return;

  const currentValue = input.value.trim();
  const shouldKeepTypedValue =
    !options.force && currentValue && !isGeneratedCoordinateValue(currentValue);

  if (shouldKeepTypedValue) return;

  const coordinateLabel = formatCoordinates(coordinates);
  input.value = options.prefix
    ? `${options.prefix} · ${coordinateLabel}`
    : coordinateLabel;
  input.title = input.value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export default function MapboxPlanner({ onRouteChange, onControlsReady, importedTrack }: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!map) return;

    const coords = importedTrack?.coordinates ?? [];
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    };

    const existingSource = map.getSource('imported-track') as mapboxgl.GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(geojson);
    } else if (map.isStyleLoaded() && coords.length >= 2) {
      map.addSource('imported-track', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'imported-track-line',
        type: 'line',
        source: 'imported-track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#e8722c',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });
    }

    if (coords.length >= 2) {
      const bounds = coords.reduce(
        (b, [lng, lat]) => b.extend([lng, lat]),
        new mapboxgl.LngLatBounds([coords[0]![0], coords[0]![1]], [coords[0]![0], coords[0]![1]]),
      );
      map.fitBounds(bounds, { padding: 60, duration: 600 });
    }
  }, [importedTrack]);

  useEffect(() => {
    let cancelled = false;
    let map: mapboxgl.Map | undefined;

    async function setupMap() {
      if (!mapboxAccessToken) {
        throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured');
      }

      const mapboxDirectionsModule = await import(
        '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
      );

      if (cancelled) return;

      map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [16.3738, 48.2082],
        zoom: 11,
      });
      mapRef.current = map;

      const directions = new mapboxDirectionsModule.default({
        accessToken: mapboxAccessToken,
        unit: 'metric',
        alternatives: true,
        profile: 'mapbox/cycling',
        steps: true,
        geometries: 'geojson',
        controls: {
          inputs: true,
          instructions: false,
          profileSwitcher: false,
          waypointNameMarkers: true,
          reverseGeocode: true,
          clearButton: true,
          interactive: true,
        },
      });

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });

      map.addControl(directions, 'top-left');
      map.addControl(geolocateControl, 'top-right');
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

      map.on('load', () => {
        const geolocateButton = document.getElementsByClassName(
          'mapboxgl-ctrl-geolocate',
        )[0];
        if (geolocateButton) {
          geolocateButton.setAttribute('title', 'Use my location as point A');
          geolocateButton.setAttribute('aria-label', 'Use my location as point A');
        }
      });

      directions.on('origin', (event) => {
        setTimeout(() => {
          setDirectionsInputValue('origin', event.feature?.geometry?.coordinates as Coordinate | undefined);
        }, 0);
      });

      directions.on('destination', (event) => {
        setTimeout(() => {
          setDirectionsInputValue('destination', event.feature?.geometry?.coordinates as Coordinate | undefined);
        }, 0);
      });

      directions.on('route', (event) => {
        const route = event.route?.[0] as DirectionsRoute | undefined;
        const start = route ? getRouteEndpoint(route, 'start') : undefined;
        const dest = route ? getRouteEndpoint(route, 'destination') : undefined;

        if (!route || !start || !dest) return;

        setDirectionsInputValue('origin', start);
        setDirectionsInputValue('destination', dest);

        onRouteChange({
          start,
          destination: dest,
          mapboxRoute: {
            distanceMeters: route.distance,
            durationSeconds: route.duration,
            geometry: route.geometry,
          },
        });
      });

      geolocateControl.on('geolocate', (event) => {
        const pos = event as unknown as GeolocationPosition;
        const coordinates: Coordinate = [pos.coords.longitude, pos.coords.latitude];
        directions.setOrigin(coordinates);

        setTimeout(() => {
          setDirectionsInputValue('origin', coordinates, {
            force: true,
            prefix: 'Current location',
          });
        }, 0);
      });

      if (onControlsReady) {
        let terrainOn = false;

        function addTerrain() {
          if (!map) return;
          if (!map.getSource('mapbox-dem')) {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            });
          }
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
          if (!map.getLayer('sky')) {
            map.addLayer({
              id: 'sky',
              type: 'sky',
              paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 90.0],
                'sky-atmosphere-sun-intensity': 15,
              },
            });
          }
        }

        function removeTerrain() {
          if (!map) return;
          map.setTerrain(null);
          if (map.getLayer('sky')) map.removeLayer('sky');
        }

        onControlsReady({
          clearRoute: () => {
            directions.removeRoutes();
            directions.setOrigin('');
            directions.setDestination('');
          },
          reverseRoute: () => {
            const origin = directions.getOrigin();
            const destination = directions.getDestination();
            if (origin?.geometry?.coordinates && destination?.geometry?.coordinates) {
              directions.setOrigin(destination.geometry.coordinates as Coordinate);
              directions.setDestination(origin.geometry.coordinates as Coordinate);
            }
          },
          toggleTerrain: () => {
            terrainOn = !terrainOn;
            if (terrainOn) addTerrain();
            else removeTerrain();
            return terrainOn;
          },
        });
      }
    }

    setupMap().catch((error: unknown) => {
      if (!cancelled) {
        console.error('Could not initialize the route planner map', error);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [onRouteChange, onControlsReady]);

  return null;
}
