'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import React, { useEffect } from 'react';

mapboxgl.accessToken =
  'pk.eyJ1IjoieXJvYWNoIiwiYSI6ImNsaXJoZ2hrcjEyb28zZW8xOWoxOGphOGYifQ.-ZVzkyZ63Y6jlkvIQq4tQw';

const UserSavedMaps = ({ savedUserPoints }) => {
  useEffect(() => {
    // const filteredPoints = savedUserPoints.filter(
    //   (savedUserPoint) => savedUserPoint.userId === userId,
    // );

    savedUserPoints.forEach((savedUserPoint) => {
      const { id, startpointLat, startpointLng, endpointLat, endpointLng } =
        savedUserPoint;

      const containerId = `map-${id}`;

      const map = new mapboxgl.Map({
        container: containerId,

        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [startpointLng, startpointLat],
        zoom: 9,
      });

      const startMarker = new mapboxgl.Marker()
        .setLngLat([startpointLat, startpointLng])
        .addTo(map);

      const endMarker = new mapboxgl.Marker()
        .setLngLat([endpointLat, endpointLng])
        .addTo(map);

      const directionsRequest = `https://api.mapbox.com/directions/v5/mapbox/cycling/${
        startMarker.getLngLat().lng
      },${startMarker.getLngLat().lat};${endMarker.getLngLat().lng},${
        endMarker.getLngLat().lat
      }?geometries=geojson&access_token=${mapboxgl.accessToken}`;

      fetch(directionsRequest)
        .then((response) => response.json())
        .then((data) => {
          const routeCoordinates = data.routes[0].geometry.coordinates;

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
            map.addSource(`route-${id}`, {
              type: 'geojson',
              data: geojson,
            });

            const bounds = routeCoordinates.reduce(
              (allbounds, coord) => allbounds.extend(coord),
              new mapboxgl.LngLatBounds(
                routeCoordinates[0],
                routeCoordinates[0],
              ),
            );

            map.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
            });

            map.addLayer({
              id: `route-${id}`,
              type: 'line',
              source: `route-${id}`,
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

      return () => map.remove();
    });
  }, [savedUserPoints]);

  return (
    <div>
      {savedUserPoints.map((savedUserPoint) => {
        const { id } = savedUserPoint;
        const containerId = `map-${id}`;
        return (
          <div
            key={id}
            id={containerId}
            style={{ width: 'auto', height: '150px', marginBottom: '20px' }}
          >
            Map is loading..
          </div>
        );
      })}
    </div>
  );
};

export default UserSavedMaps;
