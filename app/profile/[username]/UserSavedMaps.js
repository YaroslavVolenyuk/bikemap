'use client';

import Link from 'next/link';
import { useState } from 'react';
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

function RoutePreviewSvg({ geometry }) {
  if (!geometry || !Array.isArray(geometry) || geometry.length < 2) {
    return (
      <svg className={styles.routePreview} viewBox="0 0 360 120" role="img">
        <rect fill="#eef0ea" height="120" rx="14" width="360" />
        <path d="M0 88 C80 62 130 96 205 62 C270 34 320 42 360 22" fill="none" stroke="#cfe3b3" strokeWidth="52" />
        <path d="M42 80 C82 48 118 86 156 58 C202 24 244 74 310 40" fill="none" stroke="#1f5fd6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
        <circle cx="42" cy="80" fill="#22b8cf" r="12" stroke="#fff" strokeWidth="4" />
        <circle cx="310" cy="40" fill="#8b7bd8" r="12" stroke="#fff" strokeWidth="4" />
      </svg>
    );
  }

  const coords = geometry.map(([lng, lat]) => ({ x: lng, y: lat }));
  const minX = Math.min(...coords.map((c) => c.x));
  const maxX = Math.max(...coords.map((c) => c.x));
  const minY = Math.min(...coords.map((c) => c.y));
  const maxY = Math.max(...coords.map((c) => c.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const W = 360;
  const H = 120;
  const pad = 18;

  const px = (x) => pad + ((x - minX) / rangeX) * (W - pad * 2);
  const py = (y) => H - pad - ((y - minY) / rangeY) * (H - pad * 2);

  const d = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${px(c.x).toFixed(1)} ${py(c.y).toFixed(1)}`)
    .join(' ');

  const start = coords[0];
  const end = coords[coords.length - 1];

  return (
    <svg className={styles.routePreview} viewBox={`0 0 ${W} ${H}`} role="img">
      <rect fill="#eef0ea" height={H} rx="14" width={W} />
      <path d={d} fill="none" stroke="#1f5fd6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      <circle cx={px(start.x).toFixed(1)} cy={py(start.y).toFixed(1)} fill="#22b8cf" r="9" stroke="#fff" strokeWidth="3" />
      <circle cx={px(end.x).toFixed(1)} cy={py(end.y).toFixed(1)} fill="#8b7bd8" r="9" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

function RouteCard({ route, onDelete, onRename }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(route.name || '');
  const [saving, setSaving] = useState(false);

  async function handleDelete() {
    await onDelete(route.routeId);
  }

  async function handleRename() {
    if (!nameValue.trim()) return;
    setSaving(true);
    await onRename(route.routeId, nameValue.trim());
    setSaving(false);
    setEditing(false);
  }

  return (
    <article className={styles.routeCard}>
      <RoutePreviewSvg geometry={route.geometry} />
      <div className={styles.routeCardBody}>
        <div className={styles.routeCardHeader}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div className={styles.editNameRow}>
                <input
                  autoFocus
                  className={styles.editNameInput}
                  maxLength={120}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  type="text"
                  value={nameValue}
                />
                <button
                  className={styles.inlineBtn}
                  disabled={saving}
                  onClick={handleRename}
                  type="button"
                >
                  {saving ? '…' : 'Save'}
                </button>
                <button
                  className={styles.inlineBtn}
                  onClick={() => setEditing(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h2
                className={styles.routeCardTitle}
                onClick={() => {
                  setNameValue(route.name || '');
                  setEditing(true);
                }}
                title="Click to rename"
              >
                {route.name || `Route #${route.routeId}`}
              </h2>
            )}
            <p>{formatDate(route.createdAt)}</p>
          </div>
          <span>{formatDistance(route.distanceMeters)}</span>
        </div>

        <div className={styles.routeStats}>
          <span>{formatTime(route.durationMs)}</span>
          <span>{route.ascentMeters ? `+${Math.round(route.ascentMeters)} m` : '+-- m'}</span>
          <span>{route.descentMeters ? `−${Math.round(route.descentMeters)} m` : '−-- m'}</span>
        </div>

        <div className={styles.routeCardFooter}>
          <div className={styles.routeCoordinates}>
            <span>
              A {Number(route.startpointLat).toFixed(4)}, {Number(route.startpointLng).toFixed(4)}
            </span>
            <span>
              B {Number(route.endpointLat).toFixed(4)}, {Number(route.endpointLng).toFixed(4)}
            </span>
          </div>

          {confirmDelete ? (
            <div className={styles.deleteConfirm}>
              <span>Delete?</span>
              <button className={styles.dangerBtn} onClick={handleDelete} type="button">
                Yes
              </button>
              <button className={styles.inlineBtn} onClick={() => setConfirmDelete(false)} type="button">
                No
              </button>
            </div>
          ) : (
            <button
              className={styles.deleteBtn}
              onClick={() => setConfirmDelete(true)}
              title="Delete route"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'shortest', label: 'Shortest' },
  { id: 'longest', label: 'Longest' },
  { id: 'ascent', label: 'Most ascent' },
];

function sortRoutes(routes, sortBy) {
  const sorted = [...routes];
  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'shortest':
      return sorted.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
    case 'longest':
      return sorted.sort((a, b) => (b.distanceMeters || 0) - (a.distanceMeters || 0));
    case 'ascent':
      return sorted.sort((a, b) => (b.ascentMeters || 0) - (a.ascentMeters || 0));
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export default function UserSavedMaps({ savedUserPoints: initialRoutes }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');

  async function handleDelete(routeId) {
    await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
    setRoutes((prev) => prev.filter((r) => r.routeId !== routeId));
  }

  async function handleRename(routeId, name) {
    const response = await fetch(`/api/routes/${routeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      setRoutes((prev) =>
        prev.map((r) => (r.routeId === routeId ? { ...r, name } : r)),
      );
    }
  }

  if (!routes.length) {
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

  const query = search.trim().toLowerCase();
  const filtered = query
    ? routes.filter((r) => (r.name || `Route #${r.routeId}`).toLowerCase().includes(query))
    : routes;
  const sorted = sortRoutes(filtered, sortBy);

  return (
    <div>
      <div className={styles.routeListControls}>
        <input
          className={styles.searchInput}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search routes…"
          type="search"
          value={search}
        />
        <div className={styles.sortTabs}>
          {SORT_OPTIONS.map((opt) => (
            <button
              className={styles.sortTab}
              data-active={sortBy === opt.id}
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className={styles.emptyRoutes} style={{ maxWidth: 480, margin: '24px auto' }}>
          <h2>No routes match</h2>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className={styles.routesGrid}>
          {sorted.map((route) => (
            <RouteCard
              key={`route-${route.routeId}`}
              onDelete={handleDelete}
              onRename={handleRename}
              route={route}
            />
          ))}
        </div>
      )}
    </div>
  );
}
