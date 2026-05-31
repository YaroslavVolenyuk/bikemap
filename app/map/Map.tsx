'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import MapboxPlanner from './MapboxPlanner';
import styles from './map.module.scss';
import {
  type Coordinate,
  type RouteDetails,
  createRouteDetails,
  distanceBetweenMeters,
  getCumulativeDistances,
} from './routeDetails';
import { getDifficulty, getRouteWarnings, formatTime, splitDistance } from './routeUtils';
import type {
  DockState,
  MapControls,
  NavigationState,
  RoutePoints,
  RouteStatus,
  SaveStatus,
} from './types';
import { buildGpxString } from '../../util/gpx';
import { parseGpxString, type ParsedGpx } from '../../util/parseGpx';
import { mapMatchCoordinates } from '../../util/mapMatch';

function createRouteDetailsFromGpx(gpx: ParsedGpx): RouteDetails {
  const { coordinates, elevation } = gpx;
  const totalDistance = elevation.length > 0
    ? elevation[elevation.length - 1]!.distanceMeters
    : 0;

  let ascent = 0;
  let descent = 0;
  for (let i = 1; i < elevation.length; i++) {
    const diff = elevation[i]!.elevationMeters - elevation[i - 1]!.elevationMeters;
    if (diff > 0) ascent += diff;
    else descent += -diff;
  }

  const elevValues = elevation.map((e) => e.elevationMeters);
  // estimate ~15 km/h average cycling speed
  const durationMs = totalDistance > 0 ? (totalDistance / 15000) * 3_600_000 : 0;

  return {
    distanceMeters: totalDistance,
    durationMs,
    ascentMeters: ascent,
    descentMeters: descent,
    highestMeters: elevValues.length ? Math.max(...elevValues) : undefined,
    lowestMeters: elevValues.length ? Math.min(...elevValues) : undefined,
    elevation,
    surfaces: [],
    wayTypes: [],
    geometry: coordinates,
    instructions: [],
  };
}

import { Navigation } from 'lucide-react';
import BottomDock from './components/BottomDock';
import NavigationOverlay from './components/NavigationOverlay';
import RoutePanel from './components/RoutePanel';
import SaveModal from './components/SaveModal';
import TopActions from './components/TopActions';

const GPX_STORAGE_KEY = 'bikemap_imported_gpx';

type Props = {
  userId?: number;
  username?: string;
};

export default function Map({ userId, username }: Props) {
  const [routePoints, setRoutePoints] = useState<RoutePoints>();
  const [routeDetails, setRouteDetails] = useState<RouteDetails>();
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [dock, setDock] = useState<DockState>('full');
  const [panelOpen, setPanelOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [mapControls, setMapControls] = useState<MapControls | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [importedTrack, setImportedTrack] = useState<ParsedGpx | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(GPX_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ParsedGpx) : null;
    } catch {
      return null;
    }
  });
  const [terrainOn, setTerrainOn] = useState(false);
  const [matchingTrack, setMatchingTrack] = useState(false);
  const [navState, setNavState] = useState<NavigationState>('idle');
  const [navFollowing, setNavFollowing] = useState(true);
  const [currentInstructionIdx, setCurrentInstructionIdx] = useState(0);
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState(0);
  const importFileRef = useRef<HTMLInputElement>(null);
  const routeCumulativeDistRef = useRef<number[]>([]);

  // Sync GPX track to sessionStorage
  useEffect(() => {
    try {
      if (importedTrack) {
        sessionStorage.setItem(GPX_STORAGE_KEY, JSON.stringify(importedTrack));
      } else {
        sessionStorage.removeItem(GPX_STORAGE_KEY);
      }
    } catch { /* quota exceeded — ignore */ }
  }, [importedTrack]);

  // Build RouteDetails from GPX when no planned route is active
  useEffect(() => {
    if (importedTrack && !routePoints) {
      setRouteDetails(createRouteDetailsFromGpx(importedTrack));
      setRouteStatus('ready');
    }
  }, [importedTrack, routePoints]);

  // Keep cumulative distances in sync for nav progress calculation
  useEffect(() => {
    if (routeDetails?.geometry) {
      routeCumulativeDistRef.current = getCumulativeDistances(routeDetails.geometry);
    } else {
      routeCumulativeDistRef.current = [];
    }
  }, [routeDetails]);

  const handleRouteChange = useCallback((route: RoutePoints) => {
    setRoutePoints({ start: route.start, destination: route.destination });
    setSaveStatus('idle');
  }, []);

  const handleControlsReady = useCallback((controls: MapControls) => {
    setMapControls(controls);
  }, []);

  useEffect(() => {
    if (!routePoints) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      startLng: String(routePoints.start[0]),
      startLat: String(routePoints.start[1]),
      endLng: String(routePoints.destination[0]),
      endLat: String(routePoints.destination[1]),
    });

    setRouteStatus('loading');

    fetch(`/api/routes/details?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Route details failed');
        return res.json();
      })
      .then((data) => {
        const details = createRouteDetails(data);
        if (!details) throw new Error('Route details missing');
        setRouteDetails(details);
        setRouteStatus('ready');
      })
      .catch((error: Error) => {
        if (error.name === 'AbortError') return;
        setRouteStatus('error');
      });

    return () => controller.abort();
  }, [routePoints]);

  const handlePositionUpdate = useCallback((coords: Coordinate) => {
    const geometry = routeDetails?.geometry;
    const instructions = routeDetails?.instructions;
    const cumDist = routeCumulativeDistRef.current;
    if (!geometry || !cumDist.length) return;

    // Find nearest geometry point index
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < geometry.length; i++) {
      const d = distanceBetweenMeters(coords, geometry[i]!);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    }

    // Remaining route distance from nearest point
    const totalDist = cumDist[cumDist.length - 1] ?? 0;
    const traveledDist = cumDist[nearestIdx] ?? 0;
    setRemainingDistanceMeters(Math.max(0, totalDist - traveledDist));

    // Advance instruction index
    if (instructions?.length) {
      let nextIdx = instructions.findIndex((inst) => inst.pointIndex > nearestIdx);
      if (nextIdx === -1) nextIdx = instructions.length - 1;
      setCurrentInstructionIdx(nextIdx);
    }
  }, [routeDetails]);

  function startNavigation() {
    if (!routeDetails) return;
    setCurrentInstructionIdx(0);
    setRemainingDistanceMeters(routeDetails.distanceMeters);
    setNavFollowing(true);
    setNavState('active');
  }

  function stopNavigation() {
    setNavState('idle');
  }

  function handleImportGpx(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result;
      if (typeof text !== 'string') return;
      let parsed: ParsedGpx;
      try {
        parsed = parseGpxString(text);
      } catch {
        return;
      }
      setImportedTrack(parsed);

      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) return;
      setMatchingTrack(true);
      try {
        const matched = await mapMatchCoordinates(parsed.coordinates, token, 'cycling');
        if (matched) setImportedTrack({ ...parsed, coordinates: matched });
      } finally {
        setMatchingTrack(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const routeIsReady = Boolean(routePoints) || Boolean(importedTrack);

  function exportGpx() {
    if (!routeDetails) return;
    const name = 'bike-route';
    const gpx = buildGpxString(name, routeDetails.geometry, routeDetails.elevation);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openSaveModal() {
    if (!routeIsReady) return;
    setRouteName(importedTrack?.name && !routePoints ? importedTrack.name : '');
    setSaveModalOpen(true);
  }

  async function saveRoute(name: string) {
    if (!userId || saveStatus === 'saving') return;
    const gpxStart = importedTrack?.coordinates[0];
    const gpxEnd = importedTrack?.coordinates[importedTrack.coordinates.length - 1];
    const start = routePoints?.start ?? gpxStart ?? null;
    const end = routePoints?.destination ?? gpxEnd ?? null;
    if (!start || !end) return;
    setSaveModalOpen(false);
    setSaveStatus('saving');

    const response = await fetch('/api/routes/saveroute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim() || undefined,
        startpointLat: start[1],
        startpointLng: start[0],
        endpointLat: end[1],
        endpointLng: end[0],
        distanceMeters: routeDetails?.distanceMeters,
        durationMs: routeDetails?.durationMs != null ? Math.round(routeDetails.durationMs) : undefined,
        ascentMeters: routeDetails?.ascentMeters,
        descentMeters: routeDetails?.descentMeters,
        geometry: routeDetails?.geometry,
        elevation: routeDetails?.elevation,
        surfaces: routeDetails?.surfaces,
        wayTypes: routeDetails?.wayTypes,
      }),
    });

    setSaveStatus(response.ok ? 'saved' : 'error');
  }

  function clearRoute() {
    mapControls?.clearRoute();
    setRoutePoints(undefined);
    setRouteDetails(undefined);
    setRouteStatus('idle');
    setSaveStatus('idle');
    setImportedTrack(null);
  }

  const distance = splitDistance(routeDetails?.distanceMeters);
  const difficulty = getDifficulty(routeDetails);
  const duration = formatTime(routeDetails?.durationMs);
  const averageSpeed =
    routeDetails?.distanceMeters && routeDetails.durationMs
      ? `${((routeDetails.distanceMeters / 1000) / (routeDetails.durationMs / 1000 / 60 / 60)).toFixed(1)} km/h`
      : '--';
  const dockLeft = panelOpen ? '396px' : '24px';
  const warnings = getRouteWarnings(routeDetails);

  function handlePanelOpen(open: boolean) {
    setPanelOpen(open);
    if (!open && dock !== 'compact') setDock('compact');
  }

  return (
    <div className={`${styles.mapShell}${panelOpen ? ` ${styles.panelOpen}` : ''}`}>
      <div className={styles.mapCanvas} id="map" />
      <MapboxPlanner
        importedTrack={importedTrack}
        navFollowing={navFollowing}
        navigationMode={navState === 'active'}
        routeGeometry={routePoints ? routeDetails?.geometry : undefined}
        onControlsReady={handleControlsReady}
        onNavFollowingChange={setNavFollowing}
        onPositionUpdate={handlePositionUpdate}
        onRouteChange={handleRouteChange}
      />

      <TopActions
        importFileRef={importFileRef}
        importedTrack={importedTrack}
        mapControls={mapControls}
        matchingTrack={matchingTrack}
        navActive={navState === 'active'}
        routeDetails={routeDetails}
        routePoints={Boolean(routePoints)}
        saveStatus={saveStatus}
        terrainOn={terrainOn}
        userId={userId}
        username={username}
        onClearGpx={() => setImportedTrack(null)}
        onExportGpx={exportGpx}
        onImportGpx={handleImportGpx}
        onOpenSaveModal={openSaveModal}
        onStartNavigation={startNavigation}
        onTerrainToggle={setTerrainOn}
      />

      {navState === 'active' && routeDetails ? (
        <NavigationOverlay
          currentInstructionIdx={currentInstructionIdx}
          remainingDistanceMeters={remainingDistanceMeters}
          routeDetails={routeDetails}
          onStop={stopNavigation}
        />
      ) : null}

      {navState === 'active' && !navFollowing ? (
        <button
          className={styles.recenterButton}
          onClick={() => setNavFollowing(true)}
          type="button"
        >
          <Navigation size={18} />
          Recenter
        </button>
      ) : null}

      {navState !== 'active' ? (
        <RoutePanel
          averageSpeed={averageSpeed}
          difficulty={difficulty}
          distance={distance}
          duration={duration}
          mapControls={mapControls}
          panelOpen={panelOpen}
          routeDetails={routeDetails}
          routeIsReady={routeIsReady}
          routeStatus={routeStatus}
          warnings={warnings}
          onClear={clearRoute}
          onPanelOpen={handlePanelOpen}
        />
      ) : null}

      {navState !== 'active' ? (
        <BottomDock
          averageSpeed={averageSpeed}
          distance={distance}
          dock={dock}
          dockLeft={dockLeft}
          duration={duration}
          routeDetails={routeDetails}
          onDockChange={setDock}
          onExpandToPanel={() => { setPanelOpen(true); setDock('compact'); }}
        />
      ) : null}

      {saveStatus === 'error' ? (
        <div className={styles.toast}>
          Could not save this route.
          <button onClick={() => setSaveStatus('idle')} type="button">
            <X size={14} />
          </button>
        </div>
      ) : null}

      <div className={styles.scaleBar}>
        <span />
        2 km
      </div>

      <div className={styles.mapCredit}>© Mapbox © OpenStreetMap</div>

      <SaveModal
        open={saveModalOpen}
        routeName={routeName}
        onClose={() => setSaveModalOpen(false)}
        onNameChange={setRouteName}
        onSave={saveRoute}
      />
    </div>
  );
}
