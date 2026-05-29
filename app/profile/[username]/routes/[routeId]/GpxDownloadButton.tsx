'use client';

import { Download } from 'lucide-react';
import type { Coordinate, ElevationPoint } from '../../../../map/routeDetails';
import { buildGpxString } from '../../../../../util/gpx';
import styles from './routeDetail.module.scss';

type Props = {
  name: string;
  geometry: Coordinate[];
  elevation: ElevationPoint[];
  createdAt?: string;
};

export default function GpxDownloadButton({ name, geometry, elevation, createdAt }: Props) {
  function handleDownload() {
    const gpx = buildGpxString(name, geometry, elevation, createdAt);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className={styles.gpxBtn} onClick={handleDownload} type="button">
      <Download size={16} />
      Download GPX
    </button>
  );
}
