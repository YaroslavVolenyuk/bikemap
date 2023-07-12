import 'mapbox-gl/dist/mapbox-gl.css';
import { cookies } from 'next/headers';
import { getUserBySessionToken } from '../../database/users';
import Map from './Map';

export default async function Page() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('sessionToken');
  const user = !sessionToken?.value
    ? undefined
    : await getUserBySessionToken(sessionToken.value);

  const userId = user?.id;

  return (
    <main>
      <Map userId={userId} username={user?.username} />
    </main>
  );
}
