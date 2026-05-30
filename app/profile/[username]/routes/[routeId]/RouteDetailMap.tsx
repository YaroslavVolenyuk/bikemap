'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import type { Coordinate } from '../../../../map/routeDetails';
import styles from './routeDetail.module.scss';

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type Props = {
  geometry: Coordinate[];
  startLng: number;
  startLat: number;
  endLng: number;
  endLat: number;
};

export default function RouteDetailMap({ geometry, startLng, startLat, endLng, endLat }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !mapboxAccessToken) return;

    mapboxgl.accessToken = mapboxAccessToken;

    const hasRoute = geometry.length >= 2;

    const allPoints: [number, number][] = hasRoute
      ? geometry.map(([lng, lat]) => [lng, lat])
      : [[startLng, startLat], [endLng, endLat]];

    const bounds = allPoints.reduce(
      (b, pt) => b.extend(pt),
      new mapboxgl.LngLatBounds(allPoints[0]!, allPoints[0]!),
    );

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      bounds,
      fitBoundsOptions: { padding: 48 },
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      if (hasRoute) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: geometry },
          },
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#1f5fd6', 'line-width': 4 },
        });
      }

      const startPt = hasRoute ? geometry[0] : [startLng, startLat];
      const endPt = hasRoute ? geometry[geometry.length - 1] : [endLng, endLat];

      if (startPt) {
        new mapboxgl.Marker({ color: '#22b8cf' }).setLngLat([startPt[0]!, startPt[1]!]).addTo(map);
      }
      if (endPt) {
        new mapboxgl.Marker({ color: '#8b7bd8' }).setLngLat([endPt[0]!, endPt[1]!]).addTo(map);
      }
    });

    return () => map.remove();
  }, [geometry, startLng, startLat, endLng, endLat]);

  return <div className={styles.mapContainer} ref={containerRef} />;
}
