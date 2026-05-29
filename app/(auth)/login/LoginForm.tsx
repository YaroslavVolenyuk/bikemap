'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSafeReturnToPath } from '../../../util/validation';
import type { LoginResponseBodyPost } from '../../api/(auth)/login/route';
import styles from '../login/LoginForm.module.scss';

type Props = { returnTo?: string | string[] };

export default function LoginForm(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function login() {
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as LoginResponseBodyPost;

      if ('error' in data) {
        setError(data.error);
        return;
      }

      router.push(
        getSafeReturnToPath(props.returnTo) || `/profile/${data.user.username}`,
      );

      router.refresh();
    } catch {
      setError('Unable to log in right now');
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.inputs}>
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            await login();
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
              value={password}
              type="password"
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          </label>
          <br />
          <button className={styles.button}>
            log in
          </button>
          <br />
          <Link className={styles.button} href="/">
            main page
          </Link>
          {error !== '' && <div>{error}</div>}
        </form>
      </div>
    </div>
  );
}
