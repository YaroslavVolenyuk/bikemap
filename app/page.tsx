import 'mapbox-gl/dist/mapbox-gl.css';
import { cookies } from 'next/headers';
import { getUserBySessionToken } from '../database/users';
import HomePage from './LandingPage';

// type User = {
//   userId: number | undefined;
//   username: string | undefined;
// };

export default async function Page() {
  // const cookieStore = cookies();
  // const sessionToken = cookieStore.get('sessionToken');
  // const user = !sessionToken?.value
  //   ? undefined
  //   : await getUserBySessionToken(sessionToken.value);

  // const userId = user?.id;
  // console.log('user? ', user);

  return (
    <main>
      {/* <HomePage userId={userId} username={user?.username} /> */}
      <HomePage />
    </main>
  );
}
