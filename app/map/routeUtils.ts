import type { RouteDetails } from './routeDetails';
import { getFallbackRouteDetails } from './routeDetails';

export const accent = '#1f5fd6';

export function splitDistance(distanceMeters?: number): { value: string; unit: string } {
  if (!distanceMeters) return { value: '--', unit: 'km' };
  if (distanceMeters < 1000) return { value: String(Math.round(distanceMeters)), unit: 'm' };
  return { value: (distanceMeters / 1000).toFixed(1), unit: 'km' };
}

export function formatDistance(distanceMeters?: number): string {
  const d = splitDistance(distanceMeters);
  return `${d.value} ${d.unit}`;
}

export function formatTime(durationMs?: number): string {
  if (!durationMs) return '--';
  const totalMinutes = Math.max(1, Math.round(durationMs / 1000 / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatMeters(value?: number): string {
  if (typeof value !== 'number') return '--';
  return `${Math.round(value)} m`;
}

export function getRouteWarnings(details?: RouteDetails): string[] {
  if (!details) return [];
  const warnings: string[] = [];

  const ascentPer100km =
    details.distanceMeters > 0 ? (details.ascentMeters / details.distanceMeters) * 100000 : 0;
  if (ascentPer100km > 1200) warnings.push('Very hilly');
  else if (details.ascentMeters > 800) warnings.push('High ascent');

  const unpavedLabels = new Set(['Gravel', 'Dirt', 'Ground', 'Grass', 'Fine gravel', 'Cobblestone']);
  const unpavedMeters = details.surfaces
    .filter((s) => unpavedLabels.has(s.name))
    .reduce((sum, s) => sum + s.distanceMeters, 0);
  const unpavedPercent =
    details.distanceMeters > 0 ? (unpavedMeters / details.distanceMeters) * 100 : 0;
  if (unpavedPercent > 60) warnings.push('Mostly unpaved');
  else if (unpavedPercent > 30) warnings.push('Partly unpaved');

  const busyLabels = new Set(['Main road']);
  const busyMeters = details.wayTypes
    .filter((w) => busyLabels.has(w.name))
    .reduce((sum, w) => sum + w.distanceMeters, 0);
  const busyPercent =
    details.distanceMeters > 0 ? (busyMeters / details.distanceMeters) * 100 : 0;
  if (busyPercent > 20) warnings.push('Busy road sections');

  const unknownSurface = details.surfaces.find((s) => s.name === 'Unknown');
  if (unknownSurface && unknownSurface.percent > 25) warnings.push('Unknown surface');

  return warnings;
}

type FallbackRoute = ReturnType<typeof getFallbackRouteDetails>;

export function getDifficulty(details?: RouteDetails, route?: FallbackRoute): string {
  const distanceMeters = details?.distanceMeters || route?.distanceMeters || 0;
  const ascentMeters = details?.ascentMeters || 0;
  if (distanceMeters > 55000 || ascentMeters > 650) return 'Hard';
  if (distanceMeters > 30000 || ascentMeters > 250) return 'Moderate';
  return 'Easy';
}

export function gradeColor(grade: number): string {
  const abs = Math.abs(grade);
  if (abs < 1.5) return '#7bb04b';
  if (abs < 3) return '#b6cf4e';
  if (abs < 6) return '#f0a92b';
  if (abs < 10) return '#e8722c';
  return '#d63b34';
}
