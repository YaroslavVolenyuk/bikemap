import { Layers } from 'lucide-react';
import type { RouteBreakdownItem } from '../map/routeDetails';
import styles from './SurfaceBreakdown.module.scss';

const accent = '#1f5fd6';

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

type Props = {
  wayTypes: RouteBreakdownItem[];
  surfaces: RouteBreakdownItem[];
};

export default function SurfaceBreakdown({ wayTypes, surfaces }: Props) {
  return (
    <div className={styles.breakdown}>
      {wayTypes.length > 0 && (
        <section>
          <div className={styles.sectionLabel}>Road types</div>
          <div className={styles.wayTypeBar}>
            {wayTypes.map((item) => (
              <span
                key={`way-bar-${item.name}`}
                style={{
                  background: item.color || accent,
                  flexGrow: Math.max(item.distanceMeters, 1),
                }}
                title={`${item.name} ${Math.round(item.percent)}%`}
              />
            ))}
          </div>
          <div className={styles.wayTypeList}>
            {wayTypes.slice(0, 6).map((item) => (
              <div key={`way-row-${item.name}`}>
                <span style={{ background: item.color || accent }} />
                <strong>{item.name}</strong>
                <em>{formatDistance(item.distanceMeters)}</em>
              </div>
            ))}
          </div>
        </section>
      )}

      {surfaces.length > 0 && (
        <section>
          <div className={styles.sectionLabel}>Surface</div>
          <div className={styles.surfaceChips}>
            {surfaces.slice(0, 8).map((item) => (
              <span key={`surface-${item.name}`}>
                <Layers size={15} />
                {item.name}
                <small>{Math.round(item.percent)}%</small>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
