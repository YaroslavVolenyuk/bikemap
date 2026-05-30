'use client';

import {
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  RefreshCw,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import styles from '../map.module.scss';
import type { RouteDetails } from '../routeDetails';
import { formatTime } from '../routeUtils';

function formatNavDistance(meters: number): { value: string; unit: string } {
  if (meters < 1000) return { value: String(Math.round(meters / 10) * 10), unit: 'm' };
  return { value: (meters / 1000).toFixed(1), unit: 'km' };
}

function turnIcon(sign: number, size = 24): ReactNode {
  switch (sign) {
    case -3: return <CornerDownRight size={size} />;
    case -2: return <CornerUpRight size={size} />;
    case -1: return <ArrowUpRight size={size} />;
    case 1:  return <ArrowUpLeft size={size} />;
    case 2:  return <CornerUpLeft size={size} />;
    case 3:  return <CornerDownLeft size={size} />;
    case 4:  return <Flag size={size} />;
    case 5:  return <Flag size={size} />;
    case 6:  return <RefreshCw size={size} />;
    case 7:  return <ArrowUpLeft size={size} />;
    case -7: return <ArrowUpRight size={size} />;
    default: return <ArrowUp size={size} />;
  }
}

type Props = {
  routeDetails: RouteDetails;
  currentInstructionIdx: number;
  remainingDistanceMeters: number;
  onStop: () => void;
};

export default function NavigationOverlay({
  routeDetails,
  currentInstructionIdx,
  remainingDistanceMeters,
  onStop,
}: Props) {
  const instructions = routeDetails.instructions;
  const current = instructions[currentInstructionIdx];
  const next = instructions[currentInstructionIdx + 1];

  const distToTurn = current ? formatNavDistance(current.distanceMeters) : null;
  const remaining = formatNavDistance(remainingDistanceMeters);
  const remainingTime = formatTime(
    routeDetails.durationMs * (remainingDistanceMeters / routeDetails.distanceMeters),
  );

  return (
    <div className={styles.navStrip}>
      {/* Turn arrow */}
      <div className={styles.navStripArrow}>
        {current ? turnIcon(current.sign, 26) : <ArrowUp size={26} />}
      </div>

      {/* Main instruction */}
      <div className={styles.navStripMain}>
        {distToTurn ? (
          <div className={styles.navStripDist}>
            <strong>{distToTurn.value}</strong>
            <span>{distToTurn.unit}</span>
          </div>
        ) : null}
        <div className={styles.navStripText}>
          {current?.text ?? 'Follow the route'}
        </div>
        {next ? (
          <div className={styles.navStripNext}>
            <span className={styles.navStripNextIcon}>{turnIcon(next.sign, 13)}</span>
            {next.text}
          </div>
        ) : null}
      </div>

      {/* Remaining */}
      <div className={styles.navStripStats}>
        <div className={styles.navStripStat}>
          <strong>{remaining.value}</strong>
          <span>{remaining.unit}</span>
        </div>
        <div className={styles.navStripStatLabel}>{remainingTime} left</div>
      </div>

      {/* Stop */}
      <button className={styles.navStripStop} onClick={onStop} title="Stop navigation" type="button">
        <X size={15} />
      </button>
    </div>
  );
}
