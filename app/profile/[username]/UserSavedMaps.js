'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import mapboxgl from 'mapbox-gl';
import React, { useEffect } from 'react';

mapboxgl.accessToken =
  'pk.eyJ1IjoieXJvYWNoIiwiYSI6ImNsaXJoZ2hrcjEyb28zZW8xOWoxOGphOGYifQ.-ZVzkyZ63Y6jlkvIQq4tQw';

const UserSavedMaps = () => {
  useEffect(() => {
    // Create a map instance
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.662323, 45.523751], // starting position
      zoom: 12,
    });

    // Add marker for the first coordinate
    const marker1 = new mapboxgl.Marker()
      .setLngLat([-122.662323, 45.523751])
      .addTo(map);

    // Add marker for the second coordinate
    const marker2 = new mapboxgl.Marker()
      .setLngLat([-122.663309, 45.525278])
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

        // Add the GeoJSON source to the map
        map.on('load', () => {
          map.addSource('route', {
            type: 'geojson',
            data: geojson,
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
    <div id="map" style={{ width: '400px', height: '300px' }}>
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
