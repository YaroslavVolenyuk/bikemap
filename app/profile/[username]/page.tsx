import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { logout } from '../../(auth)/logout/actions';
import {
  getAllRouteIdByUserId,
  getRouteByUserId,
  getRoutes,
} from '../../../database/routes';
import { getValidSessionByToken } from '../../../database/sessions';
import {
  getUserBySessionToken,
  getUserByUsername,
} from '../../../database/users';
import { LogoutButton } from './LogoutButton';
import styles from './profile.module.scss';
import UserSavedMaps from './UserSavedMaps';

type Props = {
  params: { username: string };
};

export default async function ProfileUsernamePage({ params }: Props) {
  const user = await getUserByUsername(params.username);

  // const savedUserPoints = await getRoutes();
  const savedUserPoints = await getRouteByUserId(user.id);
  // const routeId = await getAllRouteIdByUserId(user.id);

  // console.log('allUserRoutes:', allUserRoutes);

  const sessionTokenCookie = cookies().get('sessionToken');

  const session =
    sessionTokenCookie &&
    (await getValidSessionByToken(sessionTokenCookie.value));

  if (!session) redirect('/login?returnTo=/login');

  const cookieStore = cookies();
  const sessionToken = cookieStore.get('sessionToken');

  const userIsThere = !sessionToken?.value
    ? undefined
    : await getUserBySessionToken(sessionToken.value);

  return (
    <>
      <div />
      <div>
        {userIsThere ? (
          <>
            <div className={styles.profilePage}>
              <div>Hello, {userIsThere.username}</div>
              {/* <div>id: {user?.id}</div> */}
            </div>

            <LogoutButton logout={logout} />

            <div>Your saved tours:</div>

            <UserSavedMaps savedUserPoints={savedUserPoints} />
          </>
        ) : (
          <>
            <Link href="/register">register</Link>
            <Link href="/login">login</Link>
          </>
        )}
      </div>
    </>
  );
}
