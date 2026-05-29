'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { RegisterResponseBodyPost } from '../../api/(auth)/register/route';
import styles from './RegisterForm.module.scss';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function register() {
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as RegisterResponseBodyPost;

      if ('error' in data) {
        setError(data.error);
        return;
      }

      router.push(`/profile/${data.user.username}`);
      router.refresh();
    } catch {
      setError('Unable to register right now');
    }
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.inputs}>
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            await register();
          }}
        >
          <label>
            {/* username: */}
            <input
              className={styles.inputField}
              placeholder="username"
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value)}
            />
          </label>
          <label>
            {/* password: */}
            <input
              className={styles.inputField}
              placeholder="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          </label>
          <button className={styles.button}>
            sign up
          </button>
          <br />

          <Link className={styles.button} href="/">
            main page
          </Link>
          {error !== '' && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
