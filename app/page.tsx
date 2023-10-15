import 'mapbox-gl/dist/mapbox-gl.css';
import LandingPage from './LandingPage';

// type User = {
//   userId: number | undefined;
//   username: string | undefined;
// };

export default async function Page() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
