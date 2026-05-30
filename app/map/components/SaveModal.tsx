'use client';

import { useEffect, useRef } from 'react';
import { Save, X } from 'lucide-react';
import styles from '../map.module.scss';

type Props = {
  open: boolean;
  routeName: string;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onSave: (name: string) => void;
};

export default function SaveModal({ open, routeName, onClose, onNameChange, onSave }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Save route</h2>
          <button className={styles.dockIconButton} onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>
        <input
          className={styles.modalInput}
          maxLength={120}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(routeName);
            if (e.key === 'Escape') onClose();
          }}
          placeholder="Route name (optional)"
          ref={inputRef}
          type="text"
          value={routeName}
        />
        <div className={styles.modalFooter}>
          <button className={styles.pillButton} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={styles.primaryPillButton} onClick={() => onSave(routeName)} type="button">
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
