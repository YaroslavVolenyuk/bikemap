'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import type { Coordinate } from '../../../../map/routeDetails';
import styles from './routeDetail.module.scss';

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type Props = {
  geometry: Coordinate[];
};

export default function RouteDetailMap({ geometry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !mapboxAccessToken || geometry.length < 2) return;

    mapboxgl.accessToken = mapboxAccessToken;

    const bounds = geometry.reduce(
      (b, [lng, lat]) => b.extend([lng, lat] as [number, number]),
      new mapboxgl.LngLatBounds(
        [geometry[0]![0], geometry[0]![1]],
        [geometry[0]![0], geometry[0]![1]],
      ),
    );

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      bounds,
      fitBoundsOptions: { padding: 48 },
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
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

      const start = geometry[0];
      const end = geometry[geometry.length - 1];

      if (start) {
        new mapboxgl.Marker({ color: '#22b8cf' }).setLngLat([start[0], start[1]]).addTo(map);
      }
      if (end) {
        new mapboxgl.Marker({ color: '#8b7bd8' }).setLngLat([end[0], end[1]]).addTo(map);
      }
    });

    return () => map.remove();
  }, [geometry]);

  return <div className={styles.mapContainer} ref={containerRef} />;
}
