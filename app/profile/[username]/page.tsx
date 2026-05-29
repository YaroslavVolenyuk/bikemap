import { cookies } from 'next/headers';
import type { Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from '../../(auth)/logout/actions';
import { getRouteByUserId } from '../../../database/routes';
import { getValidSessionByToken } from '../../../database/sessions';
import { getUserBySessionToken } from '../../../database/users';
import { LogoutButton } from './LogoutButton';
import styles from './profile.module.scss';
import UserSavedMaps from './UserSavedMaps';

type Props = {
  params: Promise<{ username: string }>;
};

export default async function ProfileUsernamePage({ params }: Props) {
  const cookieStore = await cookies();
  const { username } = await params;
  const sessionTokenCookie = cookieStore.get('sessionToken');

  const session =
    sessionTokenCookie &&
    (await getValidSessionByToken(sessionTokenCookie.value));

  if (!session) {
    redirect(`/login?returnTo=/profile/${username}` as Route);
  }

  const user = await getUserBySessionToken(sessionTokenCookie.value);

  if (!user) redirect('/login');
  if (user.username !== username) redirect(`/profile/${user.username}` as Route);

  const savedUserPoints = await getRouteByUserId(user.id);

  return (
    <div className={styles.background}>
      <div className={styles.profilePage}>
        <div className={styles.username}>Hello, {user.username}</div>
      </div>

      <div className={styles.description}>Your saved tours:</div>

      <UserSavedMaps savedUserPoints={savedUserPoints} />
      <div className={styles.centeredElements}>
        <LogoutButton logout={logout} />
        <Link className={styles.button} href="/map">
          Back to planning
        </Link>
      </div>
    </div>
  );
}
