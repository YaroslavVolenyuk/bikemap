import { CustomModel } from '@/stores/QueryStore';
import { LineString } from 'geojson';

// minLon, minLat, maxLon, maxLat
export type Bbox = [number, number, number, number];

export interface RoutingArgs {
  readonly points: [number, number][];
  readonly profile: string;
  readonly maxAlternativeRoutes: number;
  readonly customModel: CustomModel | null;
}

export interface RoutingRequest {
  readonly points: ReadonlyArray<[number, number]>;
  profile: string;
  locale: string;
  debug: boolean;
  points_encoded: boolean;
  instructions: boolean;
  elevation: boolean;
  optimize: string;
  'alternative_route.max_paths'?: number;
  'alternative_route.max_weight_factor'?: number;
  'ch.disable'?: boolean;
  algorithm?: 'alternative_route' | 'round_trip';
  snap_preventions?: string[];
  details?: string[];
  custom_model?: CustomModel;
}

export interface ErrorResponse {
  message: string;
  hints: any[];
}

export interface RoutingResult {
  readonly info: { copyright: string[]; took: number };
  readonly paths: Path[];
}

export interface RawResult {
  readonly info: { copyright: string[]; took: number };
  readonly paths: RawPath[];
}

export interface ApiInfo {
  readonly version: string;
  readonly bbox: Bbox;
  readonly elevation: boolean;
  readonly profiles: RoutingProfile[];
  readonly encoded_values: object[];
}

export interface RoutingProfile {
  readonly name: string;
}

export interface Path extends BasePath {
  readonly points: LineString;
  readonly snapped_waypoints: LineString;
}

export interface RawPath extends BasePath {
  readonly points: string | LineString;
  readonly snapped_waypoints: string | LineString;
}

export interface BasePath {
  readonly distance: number;
  readonly time: number;
  readonly ascend: number;
  readonly descend: number;
  readonly points_encoded: boolean;
  readonly bbox?: Bbox;
  readonly instructions: Instruction[];
  readonly details: Details;
  readonly points_order: number[];
  readonly description: string;
}

export interface Instruction {
  readonly distance: number;
  readonly interval: [number, number];
  readonly points: number[][];
  readonly sign: number;
  readonly text: string;
  readonly time: number;
}

interface Details {
  readonly street_name: [number, number, string][];
  readonly toll: [number, number, string][];
  readonly max_speed: [number, number, number][];
  readonly road_class: [number, number, string][];
  readonly road_access: [number, number, string][];
  readonly road_environment: [number, number, string][];
  readonly track_type: [number, number, string][];
  readonly country: [number, number, string][];
  readonly get_off_bike: [number, number, boolean][];
}

export interface GeocodingResult {
  readonly hits: GeocodingHit[];
  readonly took: number;
}

export interface GeocodingHit {
  readonly point: { lat: number; lng: number };
  readonly extent: Bbox;
  readonly osm_id: string;
  readonly osm_type: string;
  readonly osm_key: string;
  readonly osm_value: string;
  readonly name: string;
  readonly country: string;
  readonly city: string;
  readonly state: string;
  readonly street: string;
  readonly housenumber: string;
  readonly postcode: string;
}
