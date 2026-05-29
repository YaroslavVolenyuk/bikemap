'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import '../index.css';
import mapboxgl from 'mapbox-gl';
import { useEffect } from 'react';

const mapboxAccessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

mapboxgl.accessToken = mapboxAccessToken;

function getRouteEndpoint(route, side) {
  const legs = route?.legs || [];
  const leg = side === 'start' ? legs[0] : legs[legs.length - 1];
  const steps = leg?.steps || [];
  const step = side === 'start' ? steps[0] : steps[steps.length - 1];
  return step?.maneuver?.location;
}

function formatCoordinates(coordinates) {
  if (!coordinates) return '';

  const [lng, lat] = coordinates;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function isGeneratedCoordinateValue(value) {
  return (
    value.startsWith('Current location') ||
    /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(value)
  );
}

function setDirectionsInputValue(type, coordinates, options = {}) {
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

export default function MapboxPlanner({ onRouteChange, onControlsReady }) {
  useEffect(() => {
    let cancelled = false;
    let map;

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
          setDirectionsInputValue('origin', event.feature?.geometry?.coordinates);
        }, 0);
      });

      directions.on('destination', (event) => {
        setTimeout(() => {
          setDirectionsInputValue('destination', event.feature?.geometry?.coordinates);
        }, 0);
      });

      directions.on('route', (event) => {
        const route = event.route?.[0];
        const start = getRouteEndpoint(route, 'start');
        const destination = getRouteEndpoint(route, 'destination');

        if (!route || !start || !destination) return;

        setDirectionsInputValue('origin', start);
        setDirectionsInputValue('destination', destination);

        onRouteChange({
          start,
          destination,
          mapboxRoute: {
            distanceMeters: route.distance,
            durationSeconds: route.duration,
            geometry: route.geometry,
          },
        });
      });

      geolocateControl.on('geolocate', (event) => {
        const coordinates = [event.coords.longitude, event.coords.latitude];
        directions.setOrigin(coordinates);

        setTimeout(() => {
          setDirectionsInputValue('origin', coordinates, {
            force: true,
            prefix: 'Current location',
          });
        }, 0);
      });

      if (onControlsReady) {
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
              directions.setOrigin(destination.geometry.coordinates);
              directions.setDestination(origin.geometry.coordinates);
            }
          },
        });
      }
    }

    setupMap().catch((error) => {
      if (!cancelled) {
        console.error('Could not initialize the route planner map', error);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [onRouteChange, onControlsReady]);

  return null;
}
