'use client';

import { useMemo } from 'react';
import styles from '../map.module.scss';
import type { RouteDetails } from '../routeDetails';
import { accent, gradeColor } from '../routeUtils';

type Props = {
  details?: RouteDetails;
  compact?: boolean;
};

export default function ElevationProfile({ details, compact = false }: Props) {
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
  const maxDistance = Math.max(...sampledPoints.map((p) => p.distanceMeters));
  const elevations = sampledPoints.map((p) => p.elevationMeters);
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

  const x = (d: number) =>
    paddingLeft + (d / maxDistance) * (width - paddingLeft - paddingRight);
  const y = (e: number) =>
    paddingTop + (1 - (e - minElevation) / elevationRange) * (height - paddingTop - paddingBottom);

  const areaPath = [
    `M ${x(firstPoint.distanceMeters)} ${height - paddingBottom}`,
    ...sampledPoints.map((p) => `L ${x(p.distanceMeters)} ${y(p.elevationMeters)}`),
    `L ${x(lastPoint.distanceMeters)} ${height - paddingBottom}`,
    'Z',
  ].join(' ');

  const gradientId = compact ? 'compactElevationFill' : 'elevationFill';
  const yTicks = [
    Math.round(minElevation),
    Math.round((minElevation + maxElevation) / 2),
    Math.round(maxElevation),
  ];
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxDistance);

  return (
    <svg
      className={styles.elevationSvg}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
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

      <path d={areaPath} fill={`url(#${gradientId})`} />

      {sampledPoints.slice(1).map((point, index) => {
        const prev = sampledPoints[index];
        if (!prev) return null;
        const dd = point.distanceMeters - prev.distanceMeters;
        const de = point.elevationMeters - prev.elevationMeters;
        const grade = dd ? (de / dd) * 100 : 0;
        return (
          <line
            key={`${point.distanceMeters}-${point.elevationMeters}`}
            stroke={gradeColor(grade)}
            strokeLinecap="round"
            strokeWidth={compact ? 2.6 : 3.4}
            x1={x(prev.distanceMeters)}
            x2={x(point.distanceMeters)}
            y1={y(prev.elevationMeters)}
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
