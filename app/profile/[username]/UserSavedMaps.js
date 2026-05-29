'use client';

import Link from 'next/link';
import styles from './profile.module.scss';

function formatDistance(distanceMeters) {
  if (!distanceMeters) return 'Saved route';
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function formatTime(durationMs) {
  if (!durationMs) return 'Time not saved';

  const totalMinutes = Math.max(1, Math.round(durationMs / 1000 / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

function formatDate(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function MiniRoutePreview() {
  return (
    <svg className={styles.routePreview} viewBox="0 0 360 120" role="img">
      <rect fill="#eef0ea" height="120" rx="14" width="360" />
      <path d="M0 88 C80 62 130 96 205 62 C270 34 320 42 360 22" fill="none" stroke="#cfe3b3" strokeWidth="52" />
      <path d="M0 56 C64 30 110 48 168 34 C224 20 276 42 360 28" fill="none" stroke="#ffffff" strokeWidth="5" />
      <path d="M42 80 C82 48 118 86 156 58 C202 24 244 74 310 40" fill="none" stroke="#1f5fd6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
      <circle cx="42" cy="80" fill="#22b8cf" r="12" stroke="#fff" strokeWidth="4" />
      <circle cx="310" cy="40" fill="#8b7bd8" r="12" stroke="#fff" strokeWidth="4" />
    </svg>
  );
}

export default function UserSavedMaps({ savedUserPoints }) {
  if (!savedUserPoints.length) {
    return (
      <div className={styles.emptyRoutes}>
        <h2>No saved tours yet</h2>
        <p>Plan a route, save it, and it will appear here.</p>
        <Link className={styles.button} href="/map">
          Start planning
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.routesGrid}>
      {savedUserPoints.map((route) => (
        <article className={styles.routeCard} key={`route-${route.id}`}>
          <MiniRoutePreview />
          <div className={styles.routeCardBody}>
            <div className={styles.routeCardHeader}>
              <div>
                <h2>{route.name || `Route #${route.routeId}`}</h2>
                <p>{formatDate(route.createdAt)}</p>
              </div>
              <span>{formatDistance(route.distanceMeters)}</span>
            </div>

            <div className={styles.routeStats}>
              <span>{formatTime(route.durationMs)}</span>
              <span>{route.ascentMeters ? `+${Math.round(route.ascentMeters)} m` : '+-- m'}</span>
              <span>{route.descentMeters ? `-${Math.round(route.descentMeters)} m` : '- -- m'}</span>
            </div>

            <div className={styles.routeCoordinates}>
              <span>
                A {Number(route.startpointLat).toFixed(4)},{' '}
                {Number(route.startpointLng).toFixed(4)}
              </span>
              <span>
                B {Number(route.endpointLat).toFixed(4)},{' '}
                {Number(route.endpointLng).toFixed(4)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
