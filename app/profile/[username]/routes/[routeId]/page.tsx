import { cookies } from 'next/headers';
import type { Route as NextRoute } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getRouteByRouteId } from '../../../../../database/routes';
import { getValidSessionByToken } from '../../../../../database/sessions';
import { getUserBySessionToken } from '../../../../../database/users';
import type { Coordinate, ElevationPoint, RouteBreakdownItem } from '../../../../map/routeDetails';
import ElevationChart from '../../../../Components/ElevationChart';
import SurfaceBreakdown from '../../../../Components/SurfaceBreakdown';
import GpxDownloadButton from './GpxDownloadButton';
import RouteDetailMap from './RouteDetailMap';
import styles from './routeDetail.module.scss';

type Props = {
  params: Promise<{ username: string; routeId: string }>;
};

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T[]; } catch { return []; }
  }
  return [];
}

function formatDistance(distanceMeters?: number | null) {
  if (!distanceMeters) return '--';
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function formatDuration(durationMs?: number | null) {
  if (!durationMs) return '--';
  const totalMinutes = Math.max(1, Math.round(durationMs / 1000 / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatDate(value?: Date | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default async function RouteDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const { username, routeId } = await params;
  const sessionTokenCookie = cookieStore.get('sessionToken');

  const session =
    sessionTokenCookie && (await getValidSessionByToken(sessionTokenCookie.value));

  if (!session) {
    redirect(`/login?returnTo=/profile/${username}/routes/${routeId}` as NextRoute);
  }

  const user = await getUserBySessionToken(sessionTokenCookie!.value);
  if (!user) redirect('/login');
  if (user.username !== username) redirect(`/profile/${user.username}` as NextRoute);

  const routeIdNum = Number(routeId);
  if (!Number.isFinite(routeIdNum)) notFound();

  const route = await getRouteByRouteId(routeIdNum, user.id);
  if (!route) notFound();

  const name = route.name || `Route #${route.routeId}`;
  const geometry = parseJsonArray<Coordinate>(route.geometry);
  const elevation = parseJsonArray<ElevationPoint>(route.elevation);
  const wayTypes = parseJsonArray<RouteBreakdownItem>(route.wayTypes);
  const surfaces = parseJsonArray<RouteBreakdownItem>(route.surfaces);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.backLink} href={`/profile/${username}` as NextRoute}>
          ← Back
        </Link>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.date}>{formatDate(route.createdAt)}</p>
      </div>

      <div className={styles.mapWrapper}>
        <RouteDetailMap
          endLat={route.endpointLat}
          endLng={route.endpointLng}
          geometry={geometry}
          startLat={route.startpointLat}
          startLng={route.startpointLng}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatDistance(route.distanceMeters)}</span>
          <span className={styles.statLabel}>Distance</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatDuration(route.durationMs)}</span>
          <span className={styles.statLabel}>Duration</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {route.ascentMeters ? `+${Math.round(route.ascentMeters)} m` : '--'}
          </span>
          <span className={styles.statLabel}>Ascent</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {route.descentMeters ? `−${Math.round(route.descentMeters)} m` : '--'}
          </span>
          <span className={styles.statLabel}>Descent</span>
        </div>
      </div>

      {elevation.length >= 2 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Elevation profile</div>
          <ElevationChart elevation={elevation} />
        </div>
      )}

      {wayTypes.length > 0 && (
        <div className={styles.section}>
          <SurfaceBreakdown surfaces={surfaces} wayTypes={wayTypes} />
        </div>
      )}

      <div className={styles.actions}>
        {geometry.length >= 2 && (
          <GpxDownloadButton
            createdAt={route.createdAt?.toISOString()}
            elevation={elevation}
            geometry={geometry}
            name={name}
          />
        )}
      </div>
    </div>
  );
}
