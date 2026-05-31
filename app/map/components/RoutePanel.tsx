'use client';

import { AlertTriangle, ArrowDownRight, ArrowLeftRight, ArrowUpRight, Bike, ChevronDown, ChevronLeft, Clock3, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from '../map.module.scss';
import type { RouteDetails } from '../routeDetails';
import type { MapControls, RouteStatus } from '../types';
import ElevationProfile from './ElevationProfile';
import { DifficultyBadge, DockStat, SectionLabel, SurfaceChips, WayTypeBar } from './ui';

type Props = {
  routeDetails?: RouteDetails;
  routeIsReady: boolean;
  routeStatus: RouteStatus;
  difficulty: string;
  warnings: string[];
  mapControls: MapControls | null;
  panelOpen: boolean;
  distance: { value: string; unit: string };
  duration: string;
  averageSpeed: string;
  onClear: () => void;
  onPanelOpen: (open: boolean) => void;
};

const COLLAPSE_THRESHOLD = 80;

export default function RoutePanel({
  routeDetails,
  routeIsReady,
  routeStatus,
  difficulty,
  warnings,
  mapControls,
  panelOpen,
  distance,
  duration,
  averageSpeed,
  onClear,
  onPanelOpen,
}: Props) {
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(0);
  const didDrag = useRef(false);

  useEffect(() => {
    if (!panelOpen) setPanelHeight(null);
  }, [panelOpen]);

  function onHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelRef.current?.getBoundingClientRect().height ?? 0;
    didDrag.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return;
    didDrag.current = true;
    const delta = dragStartY.current - e.clientY;
    const newH = Math.max(80, Math.min(window.innerHeight * 0.92, dragStartHeight.current + delta));
    setPanelHeight(newH);
  }

  function onHandlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - e.clientY;
    dragStartY.current = null;
    if (!didDrag.current) return;
    didDrag.current = false;
    if (delta < -COLLAPSE_THRESHOLD) {
      setPanelHeight(null);
      onPanelOpen(false);
    } else if (Math.abs(delta) < 15) {
      setPanelHeight(null);
    }
    // else: keep expanded/contracted at dragged height
  }

  function onHandlePointerCancel() {
    dragStartY.current = null;
    didDrag.current = false;
    setPanelHeight(null);
  }

  return (
    <>
      {!panelOpen ? (
        <button
          className={styles.reopenPanelButton}
          onClick={() => onPanelOpen(true)}
          type="button"
        >
          <span>
            <Bike size={16} />
          </span>
          Your Route
          <ChevronLeft size={17} />
        </button>
      ) : null}
    <aside
      ref={panelRef}
      className={styles.routePanel}
      style={
        !panelOpen
          ? { display: 'none' }
          : panelHeight !== null
            ? { height: panelHeight, maxHeight: 'none' }
            : undefined
      }
    >
      <div
        className={styles.dragHandle}
        onPointerCancel={onHandlePointerCancel}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
      />
      <div className={styles.panelContent}>
        <div className={styles.panelHeader}>
          <div>
            <h1>
              Your Route
              <span className={styles.panelBrand}>
                bike<span>map</span>
              </span>
            </h1>
            <div className={styles.routeMeta}>
              <DifficultyBadge level={difficulty} />
              <span>
                {routeStatus === 'loading'
                  ? 'Calculating details'
                  : routeStatus === 'error'
                    ? 'Could not load route details'
                    : routeIsReady
                      ? 'Mostly bike-friendly'
                      : 'Plan from A to B'}
              </span>
            </div>
          </div>
          <button
            className={styles.panelCollapseButton}
            onClick={() => onPanelOpen(false)}
            title="Collapse panel"
            type="button"
          >
            <span className={styles.collapseIconDesktop}><ChevronLeft size={17} /></span>
            <span className={styles.collapseIconMobile}><ChevronDown size={17} /></span>
          </button>
        </div>
      </div>

      <div className={styles.panelDivider} />

      {/* geocoderInputs is intentionally outside panelScrollable so suggestions can overflow */}
      <div className={styles.geocoderInputs}>
        <div className={styles.geocoderRow}>
          <span className={styles.geocoderDot} data-type="origin" />
          <div id="geocoder-origin" className={styles.geocoderContainer} />
        </div>
        <div className={styles.geocoderRow}>
          <span className={styles.geocoderDot} data-type="dest" />
          <div id="geocoder-dest" className={styles.geocoderContainer} />
        </div>
      </div>

      <div className={styles.routeActions}>
        {routeIsReady ? (
          <button
            className={styles.routeActionBtn}
            onClick={() => mapControls?.reverseRoute()}
            title="Reverse route"
            type="button"
          >
            <ArrowLeftRight size={15} />
            Reverse
          </button>
        ) : null}
        <button
          className={styles.routeActionBtn}
          onClick={onClear}
          title="Clear all points"
          type="button"
        >
          <Trash2 size={15} />
          Clear
        </button>
      </div>

      <div className={styles.panelScrollable}>
        <div className={styles.panelContent}>
          <div className={styles.mobileSummary}>
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
          </div>

          {warnings.length > 0 ? (
            <div className={styles.warningsList}>
              {warnings.map((w) => (
                <span className={styles.warningChip} key={w}>
                  <AlertTriangle size={13} />
                  {w}
                </span>
              ))}
            </div>
          ) : null}

          <SectionLabel>Way types</SectionLabel>
          <WayTypeBar items={routeDetails?.wayTypes || []} />

          <SectionLabel>Surface</SectionLabel>
          <SurfaceChips items={routeDetails?.surfaces || []} />

          <div className={styles.panelElevation}>
            <SectionLabel>Elevation profile</SectionLabel>
            <ElevationProfile details={routeDetails} />
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
