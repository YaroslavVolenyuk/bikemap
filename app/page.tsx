import 'mapbox-gl/dist/mapbox-gl.css';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getUserBySessionToken } from '../database/users';
import HomePage from './HomePage';

export default async function Page() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('sessionToken');
  const user = !sessionToken?.value
    ? undefined
    : await getUserBySessionToken(sessionToken.value);

  const userId = user?.id;
  console.log('user? ', user);

  return (
    <main>
      {/* loggedIn ? 'show component with form' : 'show component without form' */}
      <HomePage userId={userId} />
    </main>
  );
}
