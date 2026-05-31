'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '../index.css';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { useEffect, useRef } from 'react';
import type { Coordinate } from './routeDetails';
import type { ParsedGpx } from '../../util/parseGpx';

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = mapboxAccessToken ?? '';

export type PlannerRouteChange = {
  start: Coordinate;
  destination: Coordinate;
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
  routeGeometry?: Coordinate[];
  navigationMode?: boolean;
  navFollowing?: boolean;
  onPositionUpdate?: (coords: Coordinate, heading: number | null) => void;
  onNavFollowingChange?: (following: boolean) => void;
};

function calcBearing(from: Coordinate, to: Coordinate): number {
  const lat1 = (from[1] * Math.PI) / 180;
  const lat2 = (to[1] * Math.PI) / 180;
  const dLng = ((to[0] - from[0]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export default function MapboxPlanner({
  onRouteChange,
  onControlsReady,
  importedTrack,
  routeGeometry,
  navigationMode,
  navFollowing,
  onPositionUpdate,
  onNavFollowingChange,
}: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const onPositionUpdateRef = useRef(onPositionUpdate);
  useEffect(() => { onPositionUpdateRef.current = onPositionUpdate; }, [onPositionUpdate]);
  const onNavFollowingChangeRef = useRef(onNavFollowingChange);
  useEffect(() => { onNavFollowingChangeRef.current = onNavFollowingChange; }, [onNavFollowingChange]);
  const isFollowingRef = useRef(true);
  const navigationModeRef = useRef(!!navigationMode);
  useEffect(() => { navigationModeRef.current = !!navigationMode; }, [navigationMode]);
  const lastNavCoordsRef = useRef<{ coords: Coordinate; heading: number | null } | null>(null);
  const originRef = useRef<Coordinate | null>(null);
  const destRef = useRef<Coordinate | null>(null);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const clickModeRef = useRef<'origin' | 'destination' | null>(null);
  const importedTrackRef = useRef<typeof importedTrack>(importedTrack);

  // Draw GH route geometry when it arrives
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('gh-route') as mapboxgl.GeoJSONSource | undefined;
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeGeometry ?? [],
      },
    };

    if (source) {
      source.setData(geojson);
    } else if (routeGeometry && routeGeometry.length >= 2) {
      map.addSource('gh-route', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'gh-route-line',
        type: 'line',
        source: 'gh-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#4264fb', 'line-width': 5, 'line-opacity': 0.85 },
      });
    }
  }, [routeGeometry]);

  // Keep ref in sync so the load handler can access current value
  useEffect(() => {
    importedTrackRef.current = importedTrack;
  }, [importedTrack]);

  // Draw imported GPX track
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const coords = importedTrack?.coordinates ?? [];
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    };

    function drawTrack() {
      const existingSource = map!.getSource('imported-track') as mapboxgl.GeoJSONSource | undefined;
      if (existingSource) {
        existingSource.setData(geojson);
      } else if (coords.length >= 2) {
        map!.addSource('imported-track', { type: 'geojson', data: geojson });
        map!.addLayer({
          id: 'imported-track-line',
          type: 'line',
          source: 'imported-track',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#e8722c', 'line-width': 3, 'line-dasharray': [2, 2] },
        });
      }

      if (coords.length >= 2) {
        const bounds = coords.reduce(
          (b, [lng, lat]) => b.extend([lng, lat]),
          new mapboxgl.LngLatBounds([coords[0]![0], coords[0]![1]], [coords[0]![0], coords[0]![1]]),
        );
        map!.fitBounds(bounds, { padding: 60, duration: 600 });
      }
    }

    if (map.isStyleLoaded()) {
      drawTrack();
    } else {
      map.once('load', drawTrack);
      return () => { map.off('load', drawTrack); };
    }
  }, [importedTrack]);

  // Navigation mode: GPS watch + map follow
  useEffect(() => {
    const map = mapRef.current;
    const geoCtrl = geolocateControlRef.current;
    if (!navigationMode) {
      if (map) {
        map.easeTo({ bearing: 0, pitch: 0, duration: 800 });
        // Restore geolocate control when leaving nav mode
        if (geoCtrl && !map.hasControl(geoCtrl)) {
          map.addControl(geoCtrl, 'top-right');
        }
      }
      isFollowingRef.current = true;
      lastNavCoordsRef.current = null;
      return;
    }
    if (!map) return;

    // Remove geolocate control — it auto-follows GPS independently and fights our nav logic
    if (geoCtrl && map.hasControl(geoCtrl)) {
      map.removeControl(geoCtrl);
    }

    isFollowingRef.current = true;
    let lastCoords: Coordinate | null = null;

    const markerEl = document.createElement('div');
    markerEl.className = 'nav-position-marker';
    const marker = new mapboxgl.Marker({ element: markerEl }).setLngLat([0, 0]).addTo(map);

    // Detect user-initiated map moves → stop following
    function onMoveStart(e: { originalEvent?: Event }) {
      if (e.originalEvent && isFollowingRef.current) {
        isFollowingRef.current = false;
        onNavFollowingChangeRef.current?.(false);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on('movestart', onMoveStart as any);

    let firstFix = true;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coordinate = [pos.coords.longitude, pos.coords.latitude];
        let heading: number | null = pos.coords.heading ?? null;
        if ((heading === null || isNaN(heading)) && lastCoords) {
          heading = calcBearing(lastCoords, coords);
        }
        lastCoords = coords;
        lastNavCoordsRef.current = { coords, heading };
        marker.setLngLat(coords);
        if (isFollowingRef.current) {
          const zoomOpts = firstFix ? { zoom: 17 } : {};
          map.easeTo({ center: coords, bearing: heading ?? 0, pitch: 45, duration: 1000, ...zoomOpts });
        }
        firstFix = false;
        onPositionUpdateRef.current?.(coords, heading);
      },
      (err) => console.warn('Nav geolocation error', err),
      { enableHighAccuracy: true, maximumAge: 1000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.off('movestart', onMoveStart as any);
      marker.remove();
      map.easeTo({ bearing: 0, pitch: 0, duration: 800 });
    };
  }, [navigationMode]);

  // Re-enable following when navFollowing prop flips to true
  useEffect(() => {
    if (!navFollowing) return;
    isFollowingRef.current = true;
    const last = lastNavCoordsRef.current;
    const map = mapRef.current;
    if (last && map) {
      map.easeTo({ center: last.coords, bearing: last.heading ?? 0, pitch: 45, zoom: 17, duration: 600 });
    }
  }, [navFollowing]);

  useEffect(() => {
    let cancelled = false;
    let map: mapboxgl.Map | undefined;

    function tryFireRouteChange() {
      const o = originRef.current;
      const d = destRef.current;
      if (o && d) onRouteChange({ start: o, destination: d });
    }

    function setGeocoderInput(type: 'origin' | 'destination', coords: Coordinate) {
      const id = type === 'origin' ? 'geocoder-origin' : 'geocoder-dest';
      const input = document.querySelector<HTMLInputElement>(`#${id} input`);
      if (input) {
        input.value = `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`;
      }
    }

    function setMarker(
      type: 'origin' | 'destination',
      coords: Coordinate,
      label: string,
    ) {
      if (!map) return;
      const markerRef = type === 'origin' ? originMarkerRef : destMarkerRef;
      markerRef.current?.remove();

      const el = document.createElement('div');
      el.className = type === 'origin' ? 'marker-origin' : 'marker-dest';
      const span = document.createElement('span');
      span.textContent = label;
      el.appendChild(span);

      markerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat(coords)
        .addTo(map);

      setGeocoderInput(type, coords);

      markerRef.current.on('dragend', () => {
        if (navigationModeRef.current) return;
        const lngLat = markerRef.current!.getLngLat();
        const updated: Coordinate = [lngLat.lng, lngLat.lat];
        if (type === 'origin') originRef.current = updated;
        else destRef.current = updated;
        setGeocoderInput(type, updated);
        tryFireRouteChange();
      });
    }

    async function setupMap() {
      if (!mapboxAccessToken) throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured');

      map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [16.3738, 48.2082],
        zoom: 11,
      });
      mapRef.current = map;

      if (cancelled) return;

      // Geocoder for origin
      const originGeocoder = new MapboxGeocoder({
        accessToken: mapboxAccessToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapboxgl: mapboxgl as any,
        placeholder: 'Start point',
        marker: false,
      });

      // Geocoder for destination
      const destGeocoder = new MapboxGeocoder({
        accessToken: mapboxAccessToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapboxgl: mapboxgl as any,
        placeholder: 'End point',
        marker: false,
      });

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      geolocateControlRef.current = geolocateControl;

      const originContainer = document.getElementById('geocoder-origin');
      const destContainer = document.getElementById('geocoder-dest');
      if (originContainer) originGeocoder.addTo(originContainer);
      if (destContainer) destGeocoder.addTo(destContainer);
      map.addControl(geolocateControl, 'top-right');
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

      originGeocoder.on('result', (e: { result: { geometry: { coordinates: [number, number] } } }) => {
        if (navigationModeRef.current) return;
        const coords = e.result.geometry.coordinates as Coordinate;
        originRef.current = coords;
        setMarker('origin', coords, 'A');
        tryFireRouteChange();
      });

      originGeocoder.on('clear', () => {
        if (navigationModeRef.current) return;
        originRef.current = null;
        originMarkerRef.current?.remove();
        originMarkerRef.current = null;
      });

      destGeocoder.on('result', (e: { result: { geometry: { coordinates: [number, number] } } }) => {
        if (navigationModeRef.current) return;
        const coords = e.result.geometry.coordinates as Coordinate;
        destRef.current = coords;
        setMarker('destination', coords, 'B');
        tryFireRouteChange();
      });

      destGeocoder.on('clear', () => {
        if (navigationModeRef.current) return;
        destRef.current = null;
        destMarkerRef.current?.remove();
        destMarkerRef.current = null;
      });

      geolocateControl.on('geolocate', (event) => {
        if (navigationModeRef.current) return;
        const pos = event as unknown as GeolocationPosition;
        const coords: Coordinate = [pos.coords.longitude, pos.coords.latitude];
        originRef.current = coords;
        setMarker('origin', coords, 'A');
        tryFireRouteChange();
      });

      map.on('click', (e) => {
        if (navigationModeRef.current) return;
        const coords: Coordinate = [e.lngLat.lng, e.lngLat.lat];
        destRef.current = coords;
        setMarker('destination', coords, 'B');
        clickModeRef.current = null;
        if (!originRef.current) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const gps: Coordinate = [pos.coords.longitude, pos.coords.latitude];
              originRef.current = gps;
              setMarker('origin', gps, 'A');
              tryFireRouteChange();
            },
            () => { /* GPS denied — user sets origin manually via geocoder */ },
            { enableHighAccuracy: true, timeout: 10000 },
          );
        } else {
          tryFireRouteChange();
        }
      });

      map.on('load', () => {
        // init empty GH route source so setData works after style loads
        map!.addSource('gh-route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
        });
        map!.addLayer({
          id: 'gh-route-line',
          type: 'line',
          source: 'gh-route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#4264fb', 'line-width': 5, 'line-opacity': 0.85 },
        });
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
            originRef.current = null;
            destRef.current = null;
            originMarkerRef.current?.remove();
            destMarkerRef.current?.remove();
            originMarkerRef.current = null;
            destMarkerRef.current = null;
            originGeocoder.clear();
            destGeocoder.clear();
            const oInput = document.querySelector<HTMLInputElement>('#geocoder-origin input');
            const dInput = document.querySelector<HTMLInputElement>('#geocoder-dest input');
            if (oInput) oInput.value = '';
            if (dInput) dInput.value = '';
            const source = mapRef.current?.getSource('gh-route') as mapboxgl.GeoJSONSource | undefined;
            source?.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
          },
          reverseRoute: () => {
            const o = originRef.current;
            const d = destRef.current;
            if (o && d) {
              originRef.current = d;
              destRef.current = o;
              setMarker('origin', d, 'A');
              setMarker('destination', o, 'B');
              tryFireRouteChange();
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
      if (!cancelled) console.error('Could not initialize the route planner map', error);
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      originMarkerRef.current = null;
      destMarkerRef.current = null;
    };
  }, [onRouteChange, onControlsReady]);

  return null;
}
