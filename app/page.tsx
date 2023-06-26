'use client';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Chart } from 'chart.js';
import { MapboxMap } from 'react-map-gl';
import FetchAPI from './FetchAPI';
import MapComponent from './Map';
// import MapBoxMarkers from './MapBoxMarkers';
import MapBoxRouting from './MapBoxRouting';
import MapWithGraphHopper from './MapWithGraphhopper';

export default function Home() {
  return (
    <main>
      {/* <MapComponent /> */}
      {/* <MapBoxMarkers /> */}
      {/* <MapBox onClick={handleMapClick} /> */}
      <MapBoxRouting />

      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    </main>
  );
}
