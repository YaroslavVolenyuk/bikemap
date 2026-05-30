'use client';

import { AlertTriangle, ArrowDownRight, ArrowLeftRight, ArrowUpRight, Bike, ChevronDown, ChevronLeft, Clock3, Trash2 } from 'lucide-react';
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
    <aside className={styles.routePanel} style={panelOpen ? undefined : { display: 'none' }}>
      <div className={styles.dragHandle} />
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
