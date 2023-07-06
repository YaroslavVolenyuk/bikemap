'use client';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import RoadElevationChart from './chart';
import FetchApiGraphhopper from './FetchApiGraphhopper';
import MapBoxRouting from './MapBoxRouting';
import SaveTourForm from './SaveButtonForm';

// the main component

export default function HomePage({ userId }) {
  const [distance, setDistance] = useState([]);
  const [elevation, setElevation] = useState([]);

  console.log('elevation, HomePage:', elevation);
  console.log('distance, HomePage', distance);

  const [startingPlace, setStartingPlace] = useState('');
  const [destination, setDestination] = useState('');

  const routeId = Math.floor(Math.random() * 100000) + 1;

  const startpointLat = startingPlace[0];
  const startpointLng = startingPlace[1];
  const endpointLat = destination[0];
  const endpointLng = destination[1];

  return (
    <div>
      <div>
        <MapBoxRouting
          setStartingPlace={setStartingPlace}
          setDestination={setDestination}
        />
      </div>

      <div>
        <div id="map" style={{ height: '400px' }}>
          Map is loading! keep waiting!
        </div>

        <div>
          <FetchApiGraphhopper
            startingPlace={startingPlace}
            destination={destination}
            setElevation={setElevation}
            setDistance={setDistance}
          />
        </div>

        <SaveTourForm
          routeId={routeId}
          userId={userId}
          startpointLat={startpointLat}
          startpointLng={startpointLng}
          endpointLat={endpointLat}
          endpointLng={endpointLng}
        />

        <div>
          Elevation:{' '}
          <RoadElevationChart elevation={elevation} distance={distance} />
        </div>
      </div>

      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    </div>
  );
}
