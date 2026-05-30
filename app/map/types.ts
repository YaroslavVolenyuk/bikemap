import type { Coordinate } from './routeDetails';

export type RoutePoints = {
  start: Coordinate;
  destination: Coordinate;
};

export type PlannerRouteChange = RoutePoints;

export type DockState = 'full' | 'compact' | 'hidden';
export type RouteStatus = 'idle' | 'loading' | 'ready' | 'error';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type NavigationState = 'idle' | 'active';

export type MapControls = {
  clearRoute: () => void;
  reverseRoute: () => void;
  toggleTerrain: () => boolean;
};
