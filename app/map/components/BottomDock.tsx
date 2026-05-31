'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Bike,
  ChevronDown,
  ChevronUp,
  Clock3,
  EyeOff,
  Gauge,
} from 'lucide-react';
import { type CSSProperties, useRef } from 'react';
import styles from '../map.module.scss';
import type { RouteDetails } from '../routeDetails';
import { formatMeters } from '../routeUtils';
import type { DockState } from '../types';
import ElevationProfile from './ElevationProfile';
import { DockStat } from './ui';

type Props = {
  dock: DockState;
  dockLeft: string;
  routeDetails?: RouteDetails;
  distance: { value: string; unit: string };
  duration: string;
  averageSpeed: string;
  onDockChange: (state: DockState) => void;
  onExpandToPanel?: () => void;
};

const EXPAND_THRESHOLD = 60;

export default function BottomDock({
  dock,
  dockLeft,
  routeDetails,
  distance,
  duration,
  averageSpeed,
  onDockChange,
  onExpandToPanel,
}: Props) {
  const dragStartY = useRef<number | null>(null);

  function onHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - e.clientY; // positive = dragged up
    dragStartY.current = null;
    if (delta > EXPAND_THRESHOLD && onExpandToPanel) {
      onExpandToPanel();
    }
  }

  function onHandlePointerCancel() {
    dragStartY.current = null;
  }

  if (dock === 'hidden') {
    return (
      <button className={styles.reopenDockButton} onClick={() => onDockChange('compact')} type="button">
        <Bike size={18} />
        Route stats & elevation
        <ChevronUp size={18} />
      </button>
    );
  }

  return (
    <section
      className={styles.bottomDock}
      data-state={dock}
      style={{ '--dock-left': dockLeft } as CSSProperties}
    >
      <div
        className={styles.dragHandle}
        onPointerCancel={onHandlePointerCancel}
        onPointerDown={onHandlePointerDown}
        onPointerUp={onHandlePointerUp}
      />
      <div className={styles.dockSummary}>
        <DockStat icon={<Bike size={13} />} label="Distance" unit={distance.unit} value={distance.value} />
        <DockStat icon={<Clock3 size={13} />} label="Est. time" value={duration} />
        <DockStat
          icon={<ArrowUpRight size={13} />}
          label="Ascent"
          unit="m"
          value={routeDetails ? `+${Math.round(routeDetails.ascentMeters)}` : '--'}
        />
        <DockStat
          icon={<ArrowDownRight size={13} />}
          label="Descent"
          unit="m"
          value={routeDetails ? `-${Math.round(routeDetails.descentMeters)}` : '--'}
        />
        <DockStat
          className={styles.dockStatHideMobileCompact}
          icon={<Gauge size={13} />}
          label="Avg speed"
          value={averageSpeed}
        />

        {dock === 'compact' ? (
          <div className={`${styles.sparkline} ${styles.dockStatHideMobileCompact}`}>
            <ElevationProfile compact details={routeDetails} />
          </div>
        ) : null}

        <div className={styles.dockControls}>
          {dock === 'full' ? (
            <div className={styles.highLow}>
              <span>{formatMeters(routeDetails?.highestMeters)}</span>
              <small>highest</small>
              <span>{formatMeters(routeDetails?.lowestMeters)}</span>
              <small>lowest</small>
            </div>
          ) : null}
          <button
            className={styles.dockIconButton}
            onClick={() => {
              if (dock === 'compact' && onExpandToPanel) onExpandToPanel();
              else onDockChange(dock === 'full' ? 'compact' : 'full');
            }}
            title={dock === 'full' ? 'Collapse' : 'Expand'}
            type="button"
          >
            {dock === 'full' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <button
            className={styles.dockIconButton}
            onClick={() => onDockChange('hidden')}
            title="Hide"
            type="button"
          >
            <EyeOff size={17} />
          </button>
        </div>
      </div>

      {dock === 'full' ? (
        <div className={styles.dockBody}>
          <ElevationProfile details={routeDetails} />
        </div>
      ) : null}
    </section>
  );
}
