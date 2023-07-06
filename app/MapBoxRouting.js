import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import mapboxgl from 'mapbox-gl';
import React, { useEffect, useState } from 'react';
import RoadElevationChart from './chart';
import FetchAPI from './FetchApiGraphhopper';

mapboxgl.accessToken =
  'pk.eyJ1IjoieXJvYWNoIiwiYSI6ImNsaXJoZ2hrcjEyb28zZW8xOWoxOGphOGYifQ.-ZVzkyZ63Y6jlkvIQq4tQw';
const MapBoxRouting = ({
  setStartingPlace,

  setDestination,
}) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [16.3738, 48.2082], // vienna
      zoom: 13,
    });

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
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
    map.addControl(geolocateControl, 'top-left');
    const navigation = new mapboxgl.NavigationControl();

    map.addControl(navigation);

    // geolocateControl

    directions.on('route', (e) => {
      const routes = e.route;
      if (routes && routes.length > 0) {
        const startingPlace = routes[0].legs[0].steps[0].maneuver.location;
        const destination =
          routes[0].legs[routes[0].legs.length - 1].steps[
            routes[0].legs[routes[0].legs.length - 1].steps.length - 1
          ].maneuver.location;

        setStartingPlace(startingPlace);
        console.log('Starting Place:', startingPlace);

        setDestination(destination);
        console.log('Destination:', destination);
      }
    });

    directions.on('route', (e) => {
      const waypoints = directions.getWaypoints();
      console.log('waypoints', waypoints);
    });

    return () => map.remove();
  }, []);

  return <></>;
};

export default MapBoxRouting;
