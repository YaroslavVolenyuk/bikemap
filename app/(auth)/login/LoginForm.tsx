'use client';

import { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSafeReturnToPath } from '../../../util/validation';
import { LoginResponseBodyPost } from '../../api/(auth)/login/route';
import styles from '../login/LoginForm.module.scss';

type Props = { returnTo?: string | string[] };

export default function LoginForm(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function login() {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const data: LoginResponseBodyPost = await response.json();

    if ('error' in data) {
      setError(data.error);
      console.log(data.error);
      return;
    }

    router.push(
      getSafeReturnToPath(props.returnTo) ||
        (`/profile/${data.user.username}` as Route),
    );

    router.refresh();
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.inputs}>
        <form
          className={styles.form}
          onSubmit={(event) => event.preventDefault()}
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
          <button className={styles.button} onClick={async () => await login()}>
            log in
          </button>
          {error !== '' && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
