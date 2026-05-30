'use client';

import { Bike, Download, History, LogIn, Mountain, Navigation, Save, Trash2, Upload, User, X } from 'lucide-react';
import type { Route as NextRoute } from 'next';
import Link from 'next/link';
import type { RefObject } from 'react';
import styles from '../map.module.scss';
import type { RouteDetails } from '../routeDetails';
import type { MapControls, SaveStatus } from '../types';
import type { ParsedGpx } from '../../../util/parseGpx';
import { IconButton, PillButton } from './ui';

type Props = {
  userId?: number;
  username?: string;
  mapControls: MapControls | null;
  terrainOn: boolean;
  routeDetails?: RouteDetails;
  importedTrack: ParsedGpx | null;
  routePoints: boolean;
  matchingTrack: boolean;
  saveStatus: SaveStatus;
  navActive: boolean;
  importFileRef: RefObject<HTMLInputElement | null>;
  onTerrainToggle: (next: boolean) => void;
  onExportGpx: () => void;
  onOpenSaveModal: () => void;
  onImportGpx: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearGpx: () => void;
  onStartNavigation: () => void;
};

export default function TopActions({
  userId,
  username,
  mapControls,
  terrainOn,
  routeDetails,
  importedTrack,
  routePoints,
  matchingTrack,
  saveStatus,
  navActive,
  importFileRef,
  onTerrainToggle,
  onExportGpx,
  onOpenSaveModal,
  onImportGpx,
  onClearGpx,
  onStartNavigation,
}: Props) {
  const gpxMode = Boolean(importedTrack) && !routePoints;
  const routeIsReady = routePoints || Boolean(importedTrack);

  return (
    <div className={styles.topActions}>
      <Link className={`${styles.pillLink} ${styles.oldDesignLink}`} href={'/old/map' as NextRoute}>
        <History size={17} />
        Old
      </Link>
      <IconButton
        icon={<Mountain size={16} />}
        label={terrainOn ? 'Disable 3D terrain' : 'Enable 3D terrain'}
        onClick={() => {
          const next = mapControls?.toggleTerrain();
          if (next !== undefined) onTerrainToggle(next);
        }}
      />
      <IconButton
        disabled={!routeDetails}
        icon={
          <>
            <Download size={16} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.02em' }}>GPX</span>
          </>
        }
        label="Export GPX"
        onClick={onExportGpx}
      />
      <input
        accept=".gpx"
        ref={importFileRef}
        style={{ display: 'none' }}
        type="file"
        onChange={onImportGpx}
      />

      {importedTrack ? (
        <div className={styles.gpxChip}>
          <Bike size={14} />
          <span className={styles.gpxChipName} title={importedTrack.name}>
            {matchingTrack ? 'Snapping…' : importedTrack.name}
          </span>
          <button
            aria-label="Remove GPX track"
            className={styles.gpxChipRemove}
            type="button"
            onClick={onClearGpx}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <IconButton
          icon={
            <>
              <Upload size={16} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.02em' }}>GPX</span>
            </>
          }
          label="Import GPX"
          onClick={() => importFileRef.current?.click()}
        />
      )}

      {routeDetails && !navActive ? (
        <PillButton
          icon={<Navigation size={17} />}
          primary
          onClick={onStartNavigation}
        >
          <span className={styles.pillLabelText}>Navigate</span>
        </PillButton>
      ) : null}

      {userId ? (
        <PillButton
          disabled={!routeIsReady || saveStatus === 'saving'}
          icon={<Save size={17} />}
          primary
          onClick={onOpenSaveModal}
        >
          <span className={styles.pillLabelText}>
            {saveStatus === 'saving'
              ? 'Saving…'
              : saveStatus === 'saved'
                ? 'Saved'
                : gpxMode
                  ? 'Save GPX'
                  : 'Save route'}
          </span>
        </PillButton>
      ) : (
        <Link className={styles.primaryPillLink} href="/login">
          <Save size={17} />
          <span className={styles.pillLabelText}>{gpxMode ? 'Save GPX' : 'Save route'}</span>
        </Link>
      )}

      {userId && username ? (
        <Link className={styles.pillLink} href={`/profile/${username}` as NextRoute}>
          <User size={17} />
          <span className={styles.pillLabelText}>Profile</span>
        </Link>
      ) : (
        <Link className={styles.pillLink} href="/login">
          <LogIn size={17} />
          <span className={styles.pillLabelText}>Sign in</span>
        </Link>
      )}
    </div>
  );
}
