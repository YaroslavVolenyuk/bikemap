import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { logout } from '../../(auth)/logout/actions';
import { getValidSessionByToken } from '../../../database/sessions';
import {
  getUserBySessionToken,
  getUserByUsername,
} from '../../../database/users';
import { LogoutButton } from '../../LogoutButton';
import UserSavedMaps from './UserSavedMaps';

type Props = {
  params: { username: string };
};

export default async function ProfileUsernamePage({ params }: Props) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

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
            <div>Username: {userIsThere.username}</div>
            <div>id: {user.id}</div>
            <LogoutButton logout={logout} />

            <div>Saved tours:</div>
            <UserSavedMaps />
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
