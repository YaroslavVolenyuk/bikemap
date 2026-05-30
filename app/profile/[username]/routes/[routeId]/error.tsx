'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RouteDetailError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
      <p style={{ fontSize: 32, marginBottom: 8 }}>⚠️</p>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Failed to load route</h2>
      <p style={{ color: '#86837b', fontSize: 14, marginBottom: 24 }}>
        Something went wrong. The route data may be corrupted.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: '#1f5fd6',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href={'..' as Route}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: '1.5px solid #ebe9e3',
            background: '#fff',
            color: '#23221f',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back
        </Link>
      </div>
    </div>
  );
}
