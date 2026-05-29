'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bike,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock3,
  Download,
  EyeOff,
  Gauge,
  Layers,
  LogIn,
  MapPin,
  Save,
  Upload,
  User,
  X,
} from 'lucide-react';
import type { Route as NextRoute } from 'next';
import Link from 'next/link';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import MapboxPlanner from './MapboxPlanner';
import styles from './map.module.scss';
import {
  type Coordinate,
  type MapboxRoute,
  type RouteBreakdownItem,
  type RouteDetails,
  createRouteDetails,
  getFallbackRouteDetails,
} from './routeDetails';

type Props = {
  userId?: number;
  username?: string;
};

type RoutePoints = {
  start: Coordinate;
  destination: Coordinate;
};

type PlannerRouteChange = RoutePoints & {
  mapboxRoute: MapboxRoute;
};

type DockState = 'full' | 'compact' | 'hidden';
type RouteStatus = 'idle' | 'loading' | 'ready' | 'error';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const accent = '#1f5fd6';

function splitDistance(distanceMeters?: number) {
  if (!distanceMeters) return { value: '--', unit: 'km' };
  if (distanceMeters < 1000) {
    return { value: String(Math.round(distanceMeters)), unit: 'm' };
  }

  return { value: (distanceMeters / 1000).toFixed(1), unit: 'km' };
}

function formatDistance(distanceMeters?: number) {
  const distance = splitDistance(distanceMeters);
  return `${distance.value} ${distance.unit}`;
}

function formatTime(durationMs?: number) {
  if (!durationMs) return '--';

  const totalMinutes = Math.max(1, Math.round(durationMs / 1000 / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

function formatMeters(value?: number) {
  if (typeof value !== 'number') return '--';
  return `${Math.round(value)} m`;
}

function getDifficulty(details?: RouteDetails, route?: ReturnType<typeof getFallbackRouteDetails>) {
  const distanceMeters = details?.distanceMeters || route?.distanceMeters || 0;
  const ascentMeters = details?.ascentMeters || 0;

  if (distanceMeters > 55000 || ascentMeters > 650) return 'Hard';
  if (distanceMeters > 30000 || ascentMeters > 250) return 'Moderate';

  return 'Easy';
}

function gradeColor(grade: number) {
  const absoluteGrade = Math.abs(grade);

  if (absoluteGrade < 1.5) return '#7bb04b';
  if (absoluteGrade < 3) return '#b6cf4e';
  if (absoluteGrade < 6) return '#f0a92b';
  if (absoluteGrade < 10) return '#e8722c';

  return '#d63b34';
}

function Logo() {
  return (
    <Link className={styles.logo} href="/">
      <span className={styles.logoMark}>
        <Bike size={18} strokeWidth={2.2} />
      </span>
      <span>
        bike<span>map</span>
      </span>
    </Link>
  );
}

function IconButton({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button className={styles.iconButton} title={label} type="button">
      {icon}
    </button>
  );
}

function PillButton({
  children,
  icon,
  primary,
  disabled,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  primary?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={primary ? styles.primaryPillButton : styles.pillButton}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  return (
    <span className={styles.difficultyBadge} data-level={level.toLowerCase()}>
      <span />
      {level}
    </span>
  );
}

function DockStat({
  value,
  unit,
  label,
  icon,
}: {
  value: string;
  unit?: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className={styles.dockStat}>
      <div className={styles.dockStatValue}>
        <span>{value}</span>
        {unit ? <small>{unit}</small> : null}
      </div>
      <div className={styles.dockStatLabel}>
        {icon}
        {label}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className={styles.sectionLabel}>{children}</div>;
}

function WayTypeBar({ items }: { items: RouteBreakdownItem[] }) {
  if (!items.length) {
    return <div className={styles.emptyBar}>Plan a route to see road types</div>;
  }

  return (
    <div>
      <div className={styles.wayTypeBar}>
        {items.map((item) => (
          <span
            key={`way-bar-${item.name}`}
            style={{
              background: item.color || accent,
              flexGrow: Math.max(item.distanceMeters, 1),
            }}
            title={`${item.name} ${Math.round(item.percent)}%`}
          />
        ))}
      </div>
      <div className={styles.wayTypeList}>
        {items.slice(0, 6).map((item) => (
          <div key={`way-row-${item.name}`}>
            <span style={{ background: item.color || accent }} />
            <strong>{item.name}</strong>
            <em>{formatDistance(item.distanceMeters)}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function SurfaceChips({ items }: { items: RouteBreakdownItem[] }) {
  if (!items.length) {
    return <div className={styles.emptyBar}>Surface data appears after routing</div>;
  }

  return (
    <div className={styles.surfaceChips}>
      {items.slice(0, 8).map((item) => (
        <span key={`surface-${item.name}`}>
          <Layers size={15} />
          {item.name}
          <small>{Math.round(item.percent)}%</small>
        </span>
      ))}
    </div>
  );
}

function ElevationProfile({
  details,
  compact = false,
}: {
  details?: RouteDetails;
  compact?: boolean;
}) {
  const sampledPoints = useMemo(() => {
    const points = details?.elevation || [];
    if (points.length <= 240) return points;

    const step = Math.ceil(points.length / 240);
    return points.filter((point, index) => {
      void point;
      return index % step === 0 || index === points.length - 1;
    });
  }, [details?.elevation]);

  if (sampledPoints.length < 2) {
    return (
      <div className={compact ? styles.compactChartPlaceholder : styles.chartPlaceholder}>
        Elevation profile appears after planning a route
      </div>
    );
  }

  const width = 1000;
  const height = compact ? 48 : 150;
  const paddingLeft = compact ? 4 : 42;
  const paddingRight = 10;
  const paddingTop = compact ? 6 : 12;
  const paddingBottom = compact ? 6 : 28;
  const maxDistance = Math.max(...sampledPoints.map((point) => point.distanceMeters));
  const elevations = sampledPoints.map((point) => point.elevationMeters);
  const minElevation = Math.min(...elevations) - 8;
  const maxElevation = Math.max(...elevations) + 8;
  const elevationRange = Math.max(maxElevation - minElevation, 1);
  const firstPoint = sampledPoints[0];
  const lastPoint = sampledPoints[sampledPoints.length - 1];

  if (!firstPoint || !lastPoint) {
    return (
      <div className={compact ? styles.compactChartPlaceholder : styles.chartPlaceholder}>
        Elevation profile appears after planning a route
      </div>
    );
  }

  const x = (distanceMeters: number) =>
    paddingLeft +
    (distanceMeters / maxDistance) * (width - paddingLeft - paddingRight);
  const y = (elevationMeters: number) =>
    paddingTop +
    (1 - (elevationMeters - minElevation) / elevationRange) *
      (height - paddingTop - paddingBottom);

  const areaPath = [
    `M ${x(firstPoint.distanceMeters)} ${height - paddingBottom}`,
    ...sampledPoints.map(
      (point) => `L ${x(point.distanceMeters)} ${y(point.elevationMeters)}`,
    ),
    `L ${x(lastPoint.distanceMeters)} ${height - paddingBottom}`,
    'Z',
  ].join(' ');

  const yTicks = [
    Math.round(minElevation),
    Math.round((minElevation + maxElevation) / 2),
    Math.round(maxElevation),
  ];
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * maxDistance);

  return (
    <svg
      className={styles.elevationSvg}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={compact ? 'compactElevationFill' : 'elevationFill'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.24" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {!compact
        ? yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                stroke="#e7e4dc"
                strokeWidth="1"
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text fill="#9c988e" fontSize="13" textAnchor="end" x={paddingLeft - 8} y={y(tick) + 4}>
                {tick} m
              </text>
            </g>
          ))
        : null}

      <path d={areaPath} fill={`url(#${compact ? 'compactElevationFill' : 'elevationFill'})`} />

      {sampledPoints.slice(1).map((point, index) => {
        const previousPoint = sampledPoints[index];
        if (!previousPoint) return null;

        const distanceDelta = point.distanceMeters - previousPoint.distanceMeters;
        const elevationDelta = point.elevationMeters - previousPoint.elevationMeters;
        const grade = distanceDelta ? (elevationDelta / distanceDelta) * 100 : 0;

        return (
          <line
            key={`${point.distanceMeters}-${point.elevationMeters}`}
            stroke={gradeColor(grade)}
            strokeLinecap="round"
            strokeWidth={compact ? 2.6 : 3.4}
            x1={x(previousPoint.distanceMeters)}
            x2={x(point.distanceMeters)}
            y1={y(previousPoint.elevationMeters)}
            y2={y(point.elevationMeters)}
          />
        );
      })}

      {!compact
        ? xTicks.map((tick) => (
            <text
              fill="#9c988e"
              fontSize="13"
              key={`x-${tick}`}
              textAnchor="middle"
              x={x(tick)}
              y={height - 7}
            >
              {Math.round(tick / 1000)} km
            </text>
          ))
        : null}
    </svg>
  );
}

export default function Map({ userId, username }: Props) {
  const [routePoints, setRoutePoints] = useState<RoutePoints>();
  const [mapboxRoute, setMapboxRoute] = useState<MapboxRoute>();
  const [routeDetails, setRouteDetails] = useState<RouteDetails>();
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [dock, setDock] = useState<DockState>('full');
  const [panelOpen, setPanelOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const handleRouteChange = useCallback((route: PlannerRouteChange) => {
    setRoutePoints({
      start: route.start,
      destination: route.destination,
    });
    setMapboxRoute(route.mapboxRoute);
    setSaveStatus('idle');
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

    fetch(`/api/routes/details?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Route details failed');
        return response.json();
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

  const fallbackRoute = getFallbackRouteDetails(mapboxRoute);
  const distance = splitDistance(routeDetails?.distanceMeters || fallbackRoute?.distanceMeters);
  const difficulty = getDifficulty(routeDetails, fallbackRoute);
  const duration = formatTime(routeDetails?.durationMs || fallbackRoute?.durationMs);
  const averageSpeed = routeDetails?.distanceMeters && routeDetails.durationMs
    ? `${((routeDetails.distanceMeters / 1000) / (routeDetails.durationMs / 1000 / 60 / 60)).toFixed(1)} km/h`
    : '--';
  const routeIsReady = Boolean(routePoints);
  const dockLeft = panelOpen ? '396px' : '24px';

  async function saveRoute() {
    if (!routePoints || !userId || saveStatus === 'saving') return;

    setSaveStatus('saving');

    const response = await fetch('/api/routes/saveroute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startpointLat: routePoints.start[1],
        startpointLng: routePoints.start[0],
        endpointLat: routePoints.destination[1],
        endpointLng: routePoints.destination[0],
        distanceMeters: routeDetails?.distanceMeters,
        durationMs: routeDetails?.durationMs,
        ascentMeters: routeDetails?.ascentMeters,
        descentMeters: routeDetails?.descentMeters,
        geometry: routeDetails?.geometry || mapboxRoute?.geometry?.coordinates,
        elevation: routeDetails?.elevation,
        surfaces: routeDetails?.surfaces,
        wayTypes: routeDetails?.wayTypes,
      }),
    });

    if (!response.ok) {
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saved');
  }

  return (
    <div className={styles.mapShell}>
      <div className={styles.mapCanvas} id="map" />
      <MapboxPlanner onRouteChange={handleRouteChange} />

      <div className={styles.topActions}>
        <Link className={styles.pillLink} href={'/old/map' as NextRoute}>
          <MapPin size={17} />
          Old design
        </Link>
        <IconButton icon={<Upload size={18} />} label="Import GPX" />
        <IconButton icon={<Download size={18} />} label="Export GPX" />
        {userId && username ? (
          <Link className={styles.pillLink} href={`/profile/${username}` as NextRoute}>
            <User size={17} />
            Profile
          </Link>
        ) : (
          <Link className={styles.pillLink} href="/login">
            <LogIn size={17} />
            Sign in
          </Link>
        )}
        {userId ? (
          <PillButton
            disabled={!routeIsReady || saveStatus === 'saving'}
            icon={<Save size={17} />}
            onClick={saveRoute}
            primary
          >
            {saveStatus === 'saving'
              ? 'Saving'
              : saveStatus === 'saved'
                ? 'Saved'
                : 'Save route'}
          </PillButton>
        ) : (
          <Link className={styles.primaryPillLink} href="/login">
            <Save size={17} />
            Save route
          </Link>
        )}
      </div>

      <div className={styles.leftLogo}>
        <Logo />
      </div>

      {panelOpen ? (
        <aside className={styles.routePanel}>
          <div className={styles.panelHeader}>
            <div>
              <h1>Your Route</h1>
              <div className={styles.routeMeta}>
                <DifficultyBadge level={difficulty} />
                <span>
                  {routeStatus === 'loading'
                    ? 'Calculating details'
                    : routeStatus === 'error'
                      ? 'Mapbox route shown'
                      : routeIsReady
                        ? 'Mostly bike-friendly'
                        : 'Plan from A to B'}
                </span>
              </div>
            </div>
            <button
              className={styles.panelCollapseButton}
              onClick={() => setPanelOpen(false)}
              title="Collapse panel"
              type="button"
            >
              <ChevronLeft size={17} />
            </button>
          </div>

          <SectionLabel>Way types</SectionLabel>
          <WayTypeBar items={routeDetails?.wayTypes || []} />

          <SectionLabel>Surface</SectionLabel>
          <SurfaceChips items={routeDetails?.surfaces || []} />
        </aside>
      ) : (
        <button
          className={styles.reopenPanelButton}
          onClick={() => setPanelOpen(true)}
          type="button"
        >
          <span>
            <Bike size={16} />
          </span>
          Your Route
          <ChevronLeft size={17} />
        </button>
      )}

      {dock === 'hidden' ? (
        <button className={styles.reopenDockButton} onClick={() => setDock('compact')} type="button">
          <Bike size={18} />
          Route stats & elevation
          <ChevronUp size={18} />
        </button>
      ) : (
        <section
          className={styles.bottomDock}
          data-state={dock}
          style={{ '--dock-left': dockLeft } as CSSProperties}
        >
          <div className={styles.dockSummary}>
            <DockStat
              icon={<Bike size={13} />}
              label="Distance"
              unit={distance.unit}
              value={distance.value}
            />
            <DockStat icon={<Clock3 size={13} />} label="Est. time" value={duration} />
            <DockStat
              icon={<ArrowUpRight size={13} />}
              label="Ascent"
              unit="m"
              value={routeDetails ? `+${Math.round(routeDetails.ascentMeters)}` : '--'}
            />
            <DockStat
              icon={<ArrowDownRight size={13} />}
              label="Descent"
              unit="m"
              value={routeDetails ? `-${Math.round(routeDetails.descentMeters)}` : '--'}
            />
            <DockStat icon={<Gauge size={13} />} label="Avg speed" value={averageSpeed} />

            {dock === 'compact' ? (
              <div className={styles.sparkline}>
                <ElevationProfile compact details={routeDetails} />
              </div>
            ) : null}

            <div className={styles.dockControls}>
              {dock === 'full' ? (
                <div className={styles.highLow}>
                  <span>{formatMeters(routeDetails?.highestMeters)}</span>
                  <small>highest</small>
                  <span>{formatMeters(routeDetails?.lowestMeters)}</span>
                  <small>lowest</small>
                </div>
              ) : null}
              <button
                className={styles.dockIconButton}
                onClick={() => setDock(dock === 'full' ? 'compact' : 'full')}
                title={dock === 'full' ? 'Collapse' : 'Expand'}
                type="button"
              >
                {dock === 'full' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
              <button
                className={styles.dockIconButton}
                onClick={() => setDock('hidden')}
                title="Hide"
                type="button"
              >
                <EyeOff size={17} />
              </button>
            </div>
          </div>

          {dock === 'full' ? (
            <div className={styles.dockBody}>
              <ElevationProfile details={routeDetails} />
            </div>
          ) : null}
        </section>
      )}

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
    </div>
  );
}
