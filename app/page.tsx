'use client';

import 'leaflet/dist/leaflet.css';
import MapComponent from './Map';

export default function Home() {
  return (
    <main>
      <MapComponent />

      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    </main>
  );
}
