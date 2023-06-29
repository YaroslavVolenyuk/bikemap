'use client';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import RoadElevationChart from './chart';
import FetchAPI from './FetchApiGraphhopper';
import FetchApiGraphhopper from './FetchApiGraphhopper';
import MapBoxRouting from './MapBoxRouting';

// the main component

export default function HomePage() {
  const [distance, setDistance] = useState([]);
  const [elevation, setElevation] = useState([]);

  const [startingPlace, setStartingPlace] = useState('');
  const [destination, setDestination] = useState('');

  // saving coordinates to Database API of user
  const [savedUserPointA, setSavedUserPointA] = useState('');
  const [savedUserPointB, setSavedUserPointB] = useState('');

  return (
    <main>
      <div>
        <MapBoxRouting
          distance={distance}
          setDistance={setDistance}
          elevation={elevation}
          setElevation={setElevation}
          startingPlace={startingPlace}
          setStartingPlace={setStartingPlace}
          destination={destination}
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
          />
        </div>
        <div>
          <RoadElevationChart />
        </div>
      </div>

      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    </main>
  );
}
