import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from '../../(auth)/logout/actions';
import { getRouteByUserId } from '../../../database/routes';
import { getValidSessionByToken } from '../../../database/sessions';
import { getUserBySessionToken } from '../../../database/users';
import { LogoutButton } from './LogoutButton';
import styles from './profile.module.scss';
import UserSavedMaps from './UserSavedMaps';

// type Props = {
//   params: { username: string };
// };
//
export default async function ProfileUsernamePage({ params }) {
  const sessionTokenCookie = cookies().get('sessionToken');

  const session =
    sessionTokenCookie &&
    (await getValidSessionByToken(sessionTokenCookie.value));

  if (!session) redirect(`/login?returnTo=/profile/${params.username}`);

  const user = await getUserBySessionToken(sessionTokenCookie.value);

  if (!user) redirect('/login');
  if (user.username !== params.username) redirect(`/profile/${user.username}`);

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
