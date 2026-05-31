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
  panelOpen: boolean;
  routeDetails?: RouteDetails;
  distance: { value: string; unit: string };
  duration: string;
  averageSpeed: string;
  onDockChange: (state: DockState) => void;
  onExpandToPanel?: () => void;
};

const EXPAND_THRESHOLD = 60;
const MAX_STRETCH = 70;
const DAMPEN = 0.4;

export default function BottomDock({
  dock,
  dockLeft,
  panelOpen,
  routeDetails,
  distance,
  duration,
  averageSpeed,
  onDockChange,
  onExpandToPanel,
}: Props) {
  const dragStartY = useRef<number | null>(null);
  const basePb = useRef(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  function resetStretch(animate: boolean) {
    const el = sectionRef.current;
    if (!el) return;
    if (animate) {
      el.style.transition = 'padding-bottom 0.25s cubic-bezier(0.22,1,0.36,1)';
      el.style.paddingBottom = `${basePb.current}px`;
      const onEnd = () => {
        el.style.transition = '';
        el.style.paddingBottom = '';
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    } else {
      el.style.transition = '';
      el.style.paddingBottom = '';
    }
  }

  function onHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = sectionRef.current;
    if (el) {
      el.style.transition = '';
      basePb.current = parseFloat(getComputedStyle(el).paddingBottom) || 0;
    }
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null || !sectionRef.current) return;
    const delta = dragStartY.current - e.clientY; // positive = up
    if (delta > 0) {
      const stretch = Math.min(delta * DAMPEN, MAX_STRETCH);
      sectionRef.current.style.paddingBottom = `${basePb.current + stretch}px`;
    } else {
      sectionRef.current.style.paddingBottom = `${basePb.current}px`;
    }
  }

  function onHandlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - e.clientY;
    dragStartY.current = null;
    if (delta > EXPAND_THRESHOLD && onExpandToPanel) {
      resetStretch(false);
      onExpandToPanel();
    } else {
      resetStretch(true);
    }
  }

  function onHandlePointerCancel() {
    dragStartY.current = null;
    resetStretch(true);
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
      ref={sectionRef}
      className={styles.bottomDock}
      data-state={dock}
      style={{ '--dock-left': dockLeft } as CSSProperties}
    >
      <div
        className={styles.dragHandle}
        onPointerCancel={onHandlePointerCancel}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
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
              if (dock === 'compact' && !panelOpen && onExpandToPanel) onExpandToPanel();
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
