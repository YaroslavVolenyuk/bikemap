'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import mapboxgl from 'mapbox-gl';
import React, { useEffect } from 'react';

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

mapboxgl.accessToken = mapboxAccessToken ?? '';

type DirectionsRoute = {
  legs: Array<{
    steps: Array<{
      maneuver: { location: [number, number] };
    }>;
  }>;
};

type DirectionsRouteEvent = {
  route?: DirectionsRoute[];
};

type Props = {
  setStartingPlace: (place: [number, number]) => void;
  setDestination: (destination: [number, number]) => void;
};

const MapBoxRouting = ({ setStartingPlace, setDestination }: Props) => {
  useEffect(() => {
    if (!mapboxAccessToken) {
      throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured');
    }

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [16.3738, 48.2082],
      zoom: 13,
    });

    const directions = new MapboxDirections({
      accessToken: mapboxAccessToken,
      unit: 'metric',
      alternatives: true,
      profile: 'mapbox/cycling',
      steps: true,
      geometries: 'polyline',
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

    const geolocateControl = new mapboxgl.GeolocateControl();
    map.addControl(directions, 'bottom-left');
    map.addControl(geolocateControl, 'top-right');
    map.addControl(new mapboxgl.NavigationControl());

    directions.on('route', (e: DirectionsRouteEvent) => {
      const routes = e.route;
      if (routes && routes.length > 0) {
        const firstRoute = routes[0]!;
        const startingPlace =
          firstRoute.legs[0]!.steps[0]!.maneuver.location;
        const lastLeg = firstRoute.legs[firstRoute.legs.length - 1]!;
        const dest =
          lastLeg.steps[lastLeg.steps.length - 1]!.maneuver.location;

        setStartingPlace(startingPlace);
        console.log('Starting Place:', startingPlace);

        setDestination(dest);
        console.log('Destination:', dest);
      }
    });

    directions.on('route', () => {
      const waypoints = directions.getWaypoints();
      console.log('waypoints', waypoints);
    });

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default MapBoxRouting;
