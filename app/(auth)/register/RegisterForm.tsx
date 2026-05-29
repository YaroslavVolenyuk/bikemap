'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { RegisterResponseBodyPost } from '../../api/(auth)/register/route';
import styles from './RegisterForm.module.scss';

function UserIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8M5 20a7 7 0 0114 0" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

function BikeMapLogo() {
  return (
    <svg width={130} height={28} viewBox="0 0 130 28" fill="none">
      <circle cx={14} cy={18} r={7} stroke="#1f5fd6" strokeWidth={2} />
      <circle cx={34} cy={18} r={7} stroke="#1f5fd6" strokeWidth={2} />
      <path d="M14 18l6-10h8l6 10" stroke="#1f5fd6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={24} cy={8} r={2} fill="#1f5fd6" />
      <text x="48" y="20" fontFamily="-apple-system, system-ui, sans-serif" fontSize="16" fontWeight="800" fill="#1f5fd6" letterSpacing="-0.03em">bikemap</text>
    </svg>
  );
}

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pwStrong = password.length >= 8;
  const pwEmpty = password.length === 0;

  async function register() {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as RegisterResponseBodyPost;

      if ('error' in data) {
        setError(data.error);
        return;
      }

      router.push(`/profile/${data.user.username}` as Route);
      router.refresh();
    } catch {
      setError('Unable to register right now');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.overlay} />

      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <BikeMapLogo />
        </div>

        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.subheading}>Start planning &amp; sharing your bike routes</p>

        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault();
            await register();
          }}
        >
          <div className={styles.field}>
            <span className={styles.fieldIcon}><UserIcon /></span>
            <input
              className={styles.input}
              placeholder="Username"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.currentTarget.value)}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldIcon}><LockIcon /></span>
            <input
              className={styles.input}
              placeholder="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <button
              type="button"
              className={styles.showBtn}
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className={styles.pwHint}>
            <span
              className={styles.pwDot}
              data-state={pwEmpty ? 'empty' : pwStrong ? 'strong' : 'weak'}
            />
            <span>
              {pwEmpty ? 'At least 8 characters' : pwStrong ? 'Looks good' : 'Use at least 8 characters'}
            </span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.submitBtn}
            disabled={loading || !pwStrong || !username}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.termsRow}>
          By signing up you agree to our{' '}
          <Link href={'/terms' as Route} className={styles.termsLink}>Terms</Link>
          {' '}&amp;{' '}
          <Link href={'/privacy' as Route} className={styles.termsLink}>Privacy Policy</Link>
        </p>

        <p className={styles.loginRow}>
          Already have an account?{' '}
          <Link href="/login" className={styles.loginLink}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
