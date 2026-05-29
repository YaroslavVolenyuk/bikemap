import 'mapbox-gl/dist/mapbox-gl.css';
import { cookies } from 'next/headers';
import { getUserBySessionToken } from '../../../database/users';
import OldMap from './OldMap';

export default async function OldMapPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken');
  const user = !sessionToken?.value
    ? undefined
    : await getUserBySessionToken(sessionToken.value);

  return (
    <main>
      <OldMap userId={user?.id} username={user?.username} />
    </main>
  );
}
