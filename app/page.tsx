'use client';

import 'leaflet/dist/leaflet.css';
import MapComponent from './Map';
import MapWithGraphHopper from './MapWithGraphhopper';

export default function Home() {
  return (
    <main>
      <MapComponent />

      <MapWithGraphHopper />
      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    </main>
  );
}
