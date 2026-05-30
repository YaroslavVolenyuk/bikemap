'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import MapboxPlanner from './MapboxPlanner';
import styles from './map.module.scss';
import {
  type RouteDetails,
  createRouteDetails,
} from './routeDetails';
import { getDifficulty, getRouteWarnings, formatTime, splitDistance } from './routeUtils';
import type {
  DockState,
  MapControls,
  RoutePoints,
  RouteStatus,
  SaveStatus,
} from './types';
import { buildGpxString } from '../../util/gpx';
import { parseGpxString, type ParsedGpx } from '../../util/parseGpx';
import { mapMatchCoordinates } from '../../util/mapMatch';
import BottomDock from './components/BottomDock';
import RoutePanel from './components/RoutePanel';
import SaveModal from './components/SaveModal';
import TopActions from './components/TopActions';
import { Logo } from './components/ui';

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
  const [importedTrack, setImportedTrack] = useState<ParsedGpx | null>(null);
  const [terrainOn, setTerrainOn] = useState(false);
  const [matchingTrack, setMatchingTrack] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

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
    setRouteDetails(undefined);

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

  const routeIsReady = Boolean(routePoints);

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
    setRouteName('');
    setSaveModalOpen(true);
  }

  async function saveRoute(name: string) {
    if (!routePoints || !userId || saveStatus === 'saving') return;
    setSaveModalOpen(false);
    setSaveStatus('saving');

    const response = await fetch('/api/routes/saveroute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim() || undefined,
        startpointLat: routePoints.start[1],
        startpointLng: routePoints.start[0],
        endpointLat: routePoints.destination[1],
        endpointLng: routePoints.destination[0],
        distanceMeters: routeDetails?.distanceMeters,
        durationMs: routeDetails?.durationMs,
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

  return (
    <div className={styles.mapShell}>
      <div className={styles.mapCanvas} id="map" />
      <MapboxPlanner
        importedTrack={importedTrack}
        routeGeometry={routeDetails?.geometry}
        onControlsReady={handleControlsReady}
        onRouteChange={handleRouteChange}
      />

      <TopActions
        importFileRef={importFileRef}
        importedTrack={importedTrack}
        mapControls={mapControls}
        matchingTrack={matchingTrack}
        routeDetails={routeDetails}
        routeIsReady={routeIsReady}
        saveStatus={saveStatus}
        terrainOn={terrainOn}
        userId={userId}
        username={username}
        onExportGpx={exportGpx}
        onImportGpx={handleImportGpx}
        onOpenSaveModal={openSaveModal}
        onTerrainToggle={setTerrainOn}
      />

      <div className={styles.leftLogo}>
        <Logo />
      </div>

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
        onPanelOpen={setPanelOpen}
      />

      <BottomDock
        averageSpeed={averageSpeed}
        distance={distance}
        dock={dock}
        dockLeft={dockLeft}
        duration={duration}
        routeDetails={routeDetails}
        onDockChange={setDock}
      />

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
