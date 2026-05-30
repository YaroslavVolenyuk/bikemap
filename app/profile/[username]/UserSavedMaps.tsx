'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Route } from '../../../migrations/1687943012-createRoutes';
import type { Coordinate } from '../../map/routeDetails';
import styles from './profile.module.scss';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

function encodePolylineValue(val: number): string {
  val = val < 0 ? ~(val << 1) : val << 1;
  let result = '';
  while (val >= 0x20) {
    result += String.fromCharCode((0x20 | (val & 0x1f)) + 63);
    val >>>= 5;
  }
  return result + String.fromCharCode(val + 63);
}

function encodePolyline(coords: Coordinate[]): string {
  let out = '';
  let prevLat = 0;
  let prevLng = 0;
  for (const [lng, lat] of coords) {
    out += encodePolylineValue(Math.round((lat - prevLat) * 1e5));
    out += encodePolylineValue(Math.round((lng - prevLng) * 1e5));
    prevLat = lat;
    prevLng = lng;
  }
  return out;
}

function buildStaticImageUrl(
  geometry: Coordinate[] | null | undefined,
  width = 360,
  height = 120,
): string | null {
  if (!geometry?.length || geometry.length < 2 || !MAPBOX_TOKEN) return null;
  const step = Math.max(1, Math.floor(geometry.length / 80));
  const sampled = geometry.filter((_, i) => i % step === 0 || i === geometry.length - 1);
  const encoded = encodeURIComponent(encodePolyline(sampled));
  const [startLng, startLat] = geometry[0]!;
  const [endLng, endLat] = geometry[geometry.length - 1]!;
  const overlays = [
    `path-4+1f5fd6-0.9(${encoded})`,
    `pin-s+22b8cf(${startLng.toFixed(5)},${startLat.toFixed(5)})`,
    `pin-s+8b7bd8(${endLng.toFixed(5)},${endLat.toFixed(5)})`,
  ].join(',');
  return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${overlays}/auto/${width}x${height}@2x?padding=24&access_token=${MAPBOX_TOKEN}`;
}

function formatDistance(distanceMeters: number | null | undefined): string {
  if (!distanceMeters) return 'Saved route';
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function formatTime(durationMs: number | null | undefined): string {
  if (!durationMs) return 'Time not saved';
  const totalMinutes = Math.max(1, Math.round(durationMs / 1000 / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatDate(value: Date | undefined): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getGeometry(route: Route): Coordinate[] | null {
  if (!Array.isArray(route.geometry)) return null;
  return route.geometry as Coordinate[];
}

type SurfaceItem = { name?: string; distanceMeters?: number };

function getSurfaces(route: Route): SurfaceItem[] | null {
  if (!Array.isArray(route.surfaces)) return null;
  return route.surfaces as SurfaceItem[];
}

function RoutePreview({ geometry }: { geometry: Coordinate[] | null }) {
  const url = buildStaticImageUrl(geometry);
  if (url) {
    return (
      <Image
        alt="Route map preview"
        className={styles.routePreview}
        height={120}
        src={url}
        width={360}
      />
    );
  }
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

type RouteCardProps = {
  route: Route;
  username: string;
  onDelete: (routeId: number) => Promise<void>;
  onRename: (routeId: number, name: string) => Promise<void>;
};

function RouteCard({ route, username, onDelete, onRename }: RouteCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(route.name ?? '');
  const [saving, setSaving] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      editInputRef.current?.focus();
    }
  }, [editing]);

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
      <Link href={`/profile/${username}/routes/${route.routeId}`}>
        <RoutePreview geometry={getGeometry(route)} />
      </Link>
      <div className={styles.routeCardBody}>
        <div className={styles.routeCardHeader}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div className={styles.editNameRow}>
                <input
                  className={styles.editNameInput}
                  maxLength={120}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleRename();
                    }
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  ref={editInputRef}
                  type="text"
                  value={nameValue}
                />
                <button
                  className={styles.inlineBtn}
                  disabled={saving}
                  onClick={() => void handleRename()}
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
              <button
                className={styles.routeCardTitle}
                onClick={() => {
                  setNameValue(route.name ?? '');
                  setEditing(true);
                }}
                title="Click to rename"
                type="button"
              >
                {route.name ?? `Route #${route.routeId}`}
              </button>
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
              <button className={styles.dangerBtn} onClick={() => void handleDelete()} type="button">
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

const DISTANCE_FILTERS = [
  { id: 'any', label: 'Any distance' },
  { id: 'short', label: '< 20 km' },
  { id: 'medium', label: '20–50 km' },
  { id: 'long', label: '50+ km' },
] as const;

type DistanceFilterId = (typeof DISTANCE_FILTERS)[number]['id'];

const SURFACE_FILTERS = [
  { id: 'paved', label: 'Paved' },
  { id: 'gravel', label: 'Gravel / Dirt' },
  { id: 'mixed', label: 'Mixed' },
] as const;

type SurfaceFilterId = (typeof SURFACE_FILTERS)[number]['id'];

function getSurfaceType(surfaces: SurfaceItem[] | null): SurfaceFilterId | null {
  if (!surfaces || surfaces.length === 0) return null;
  const total = surfaces.reduce((sum, s) => sum + (s.distanceMeters ?? 0), 0);
  if (total === 0) return null;
  const paved = surfaces
    .filter((s) => {
      const n = (s.name ?? '').toLowerCase();
      return n.includes('paved') || n.includes('asphalt') || n.includes('concrete');
    })
    .reduce((sum, s) => sum + (s.distanceMeters ?? 0), 0);
  const pavedPct = paved / total;
  if (pavedPct >= 0.8) return 'paved';
  if (pavedPct <= 0.3) return 'gravel';
  return 'mixed';
}

type FilterState = {
  distance: DistanceFilterId;
  surfaces: SurfaceFilterId[];
};

function filterRoutes(routes: Route[], { distance, surfaces }: FilterState): Route[] {
  return routes.filter((r) => {
    if (distance !== 'any') {
      const km = (r.distanceMeters ?? 0) / 1000;
      if (distance === 'short' && km >= 20) return false;
      if (distance === 'medium' && (km < 20 || km > 50)) return false;
      if (distance === 'long' && km <= 50) return false;
    }
    if (surfaces.length > 0) {
      const type = getSurfaceType(getSurfaces(r));
      if (type === null) return true;
      if (!surfaces.includes(type)) return false;
    }
    return true;
  });
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'shortest', label: 'Shortest' },
  { id: 'longest', label: 'Longest' },
  { id: 'ascent', label: 'Most ascent' },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]['id'];

function sortRoutes(routes: Route[], sortBy: SortId): Route[] {
  const sorted = [...routes];
  switch (sortBy) {
    case 'oldest':
      return sorted.sort(
        (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0),
      );
    case 'shortest':
      return sorted.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
    case 'longest':
      return sorted.sort((a, b) => (b.distanceMeters ?? 0) - (a.distanceMeters ?? 0));
    case 'ascent':
      return sorted.sort((a, b) => (b.ascentMeters ?? 0) - (a.ascentMeters ?? 0));
    default:
      return sorted.sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
  }
}

type Props = {
  savedUserPoints: Route[];
  username: string;
};

export default function UserSavedMaps({ savedUserPoints: initialRoutes, username }: Props) {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [sortBy, setSortBy] = useState<SortId>('newest');
  const [search, setSearch] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilterId>('any');
  const [surfaceFilters, setSurfaceFilters] = useState<SurfaceFilterId[]>([]);

  function toggleSurface(id: SurfaceFilterId) {
    setSurfaceFilters((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const activeFilterCount =
    (distanceFilter !== 'any' ? 1 : 0) + surfaceFilters.length;

  function clearFilters() {
    setDistanceFilter('any');
    setSurfaceFilters([]);
  }

  async function handleDelete(routeId: number) {
    await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
    setRoutes((prev) => prev.filter((r) => r.routeId !== routeId));
  }

  async function handleRename(routeId: number, name: string) {
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
  const searched = query
    ? routes.filter((r) => (r.name ?? `Route #${r.routeId}`).toLowerCase().includes(query))
    : routes;
  const filtered = filterRoutes(searched, { distance: distanceFilter, surfaces: surfaceFilters });
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
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Distance</span>
            <div className={styles.filterChips}>
              {DISTANCE_FILTERS.map((opt) => (
                <button
                  className={styles.filterChip}
                  data-active={distanceFilter === opt.id}
                  key={opt.id}
                  onClick={() => setDistanceFilter(opt.id)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Surface</span>
            <div className={styles.filterChips}>
              {SURFACE_FILTERS.map((opt) => (
                <button
                  className={styles.filterChip}
                  data-active={surfaceFilters.includes(opt.id)}
                  key={opt.id}
                  onClick={() => toggleSurface(opt.id)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button className={styles.clearFilters} onClick={clearFilters} type="button">
              Clear filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className={styles.emptyRoutes} style={{ maxWidth: 480, margin: '24px auto' }}>
          <h2>No routes match</h2>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className={styles.routesGrid}>
          {sorted.map((route) => (
            <RouteCard
              key={`route-${route.routeId}`}
              onDelete={handleDelete}
              onRename={handleRename}
              route={route}
              username={username}
            />
          ))}
        </div>
      )}
    </div>
  );
}
