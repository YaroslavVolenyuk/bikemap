declare module 'turf' {
  interface TurfFeature {
    type: 'Feature';
    geometry: { type: string; coordinates: number[] };
  }
  export function point(coordinates: [number, number]): TurfFeature;
  export function distance(from: TurfFeature, to: TurfFeature): number;
}
