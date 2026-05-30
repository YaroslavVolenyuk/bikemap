'use client';

import { Bike, Layers } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from '../map.module.scss';
import type { RouteBreakdownItem } from '../routeDetails';
import { accent, formatDistance } from '../routeUtils';

export function Logo() {
  return (
    <Link className={styles.logo} href="/">
      <span className={styles.logoMark}>
        <Bike size={18} strokeWidth={2.2} />
      </span>
      <span>
        bike<span>map</span>
      </span>
    </Link>
  );
}

export function IconButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={styles.iconButton} disabled={disabled} onClick={onClick} title={label} type="button">
      {icon}
    </button>
  );
}

export function PillButton({
  children,
  icon,
  primary,
  disabled,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  primary?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={primary ? styles.primaryPillButton : styles.pillButton}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

export function DifficultyBadge({ level }: { level: string }) {
  return (
    <span className={styles.difficultyBadge} data-level={level.toLowerCase()}>
      <span />
      {level}
    </span>
  );
}

export function DockStat({
  value,
  unit,
  label,
  icon,
}: {
  value: string;
  unit?: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className={styles.dockStat}>
      <div className={styles.dockStatValue}>
        <span>{value}</span>
        {unit ? <small>{unit}</small> : null}
      </div>
      <div className={styles.dockStatLabel}>
        {icon}
        {label}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className={styles.sectionLabel}>{children}</div>;
}

export function WayTypeBar({ items }: { items: RouteBreakdownItem[] }) {
  if (!items.length) {
    return <div className={styles.emptyBar}>Plan a route to see road types</div>;
  }

  return (
    <div>
      <div className={styles.wayTypeBar}>
        {items.map((item) => (
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
        {items.slice(0, 6).map((item) => (
          <div key={`way-row-${item.name}`}>
            <span style={{ background: item.color || accent }} />
            <strong>{item.name}</strong>
            <em>{formatDistance(item.distanceMeters)}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SurfaceChips({ items }: { items: RouteBreakdownItem[] }) {
  if (!items.length) {
    return <div className={styles.emptyBar}>Surface data appears after routing</div>;
  }

  return (
    <div className={styles.surfaceChips}>
      {items.slice(0, 8).map((item) => (
        <span key={`surface-${item.name}`}>
          <Layers size={15} />
          {item.name}
          <small>{Math.round(item.percent)}%</small>
        </span>
      ))}
    </div>
  );
}
