'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import mapboxgl from 'mapbox-gl';
import React, { useEffect } from 'react';

mapboxgl.accessToken =
  'pk.eyJ1IjoieXJvYWNoIiwiYSI6ImNsaXJoZ2hrcjEyb28zZW8xOWoxOGphOGYifQ.-ZVzkyZ63Y6jlkvIQq4tQw';

// fake database:
const savedRoutes = [
  {
    id: 1,
    startPoint: { lng: 16.34985, lat: 48.21483 },
    endPoint: { lng: 16.38058, lat: 48.20757 },
  },
  {
    id: 2,
    startPoint: { lng: 16.12345, lat: 48.54321 },
    endPoint: { lng: 16.98765, lat: 48.13579 },
  },
];

// call coordinates from DataBase API and draw route

const UserSavedMaps = (savedUserPointA, savedUserPointB) => {
  useEffect(() => {
    // Create a map instance
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [16.3738, 48.2082], // starting position
      zoom: 9,
    });

    // Add marker for the first coordinate
    const marker1 = new mapboxgl.Marker()
      .setLngLat([16.34985, 48.21483])
      .addTo(map);

    // Add marker for the second coordinate
    const marker2 = new mapboxgl.Marker()
      .setLngLat([16.38058, 48.20757])
      .addTo(map);

    // Fetch the route from Mapbox Directions API
    const directionsRequest = `https://api.mapbox.com/directions/v5/mapbox/cycling/${
      marker1.getLngLat().lng
    },${marker1.getLngLat().lat};${marker2.getLngLat().lng},${
      marker2.getLngLat().lat
    }?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(directionsRequest)
      .then((response) => response.json())
      .then((data) => {
        // Extract the route coordinates from the API response
        const routeCoordinates = data.routes[0].geometry.coordinates;

        // Create a GeoJSON source with the route coordinates
        const geojson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates,
              },
            },
          ],
        };

        map.on('load', () => {
          map.addSource('route', {
            type: 'geojson',
            data: geojson,
          });

          const bounds = routeCoordinates.reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(routeCoordinates[0], routeCoordinates[0]),
          );

          // Fit the map to the bounds
          map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
          });

          // Add a line layer to the map
          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#888',
              'line-width': 6,
            },
          });
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // Clean up
    return () => map.remove();
  }, []);

  return (
    <div id="map" style={{ width: 'auto', height: '150px' }}>
      Map is loading..
    </div>
  );
};

export default UserSavedMaps;

// useEffect(() => {
//   const map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v11',
//     center: [16.3738, 48.2082],
//     zoom: 12,
//   });

//   // map.addControl();

//   const routeCoordinates = [
//     [16.34985, 48.21483],
//     [16.38058, 48.20757],
//   ];

//   const route = {
//     type: 'Feature',
//     properties: {},
//     geometry: {
//       type: 'LineString',
//       coordinates: routeCoordinates,
//     },
//   };

//   map.on('load', () => {
//     map.addSource('route', {
//       type: 'geojson',
//       data: {
//         type: 'FeatureCollection',
//         features: [route],
//       },
//     });

//     map.addLayer({
//       id: 'route',
//       type: 'line',
//       source: 'route',
//       layout: {
//         'line-join': 'round', //
//         'line-cap': 'round', //
//       },
//       paint: {
//         'line-color': 'red',
//         'line-width': 6,
//       },
//     });
//   });

//   return () => {
//     map.remove();
//   };
// }, []);
