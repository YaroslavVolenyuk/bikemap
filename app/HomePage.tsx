'use client';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import FetchApiGraphhopper from './FetchApiGraphhopper';
import MapBoxRouting from './MapBoxRouting';
import SaveTourForm from './SaveButtonForm';

// the main component

export default function HomePage({ userId }) {
  const [distance, setDistance] = useState([]);
  const [elevation, setElevation] = useState([]);

  const [startingPlace, setStartingPlace] = useState('');
  const [destination, setDestination] = useState('');

  const [savedUserPointA, setSavedUserPointA] = useState('');
  const [savedUserPointB, setSavedUserPointB] = useState('');

  const startpointId = Math.floor(Math.random() * 100000) + 1;
  const endpointId = Math.floor(Math.random() * 100000) + 1;
  const routeId = Math.floor(Math.random() * 100000) + 1;

  console.log('routeId', routeId);
  console.log('startpointId', startpointId);
  console.log('endpointId', endpointId);
  console.log('startingPlace', startingPlace);
  console.log('destination', destination);

  // console.log(
  //   'HOMEPAGE:',
  //   'userId',
  //   userId,
  //   'routeId',
  //   routeId,
  //   'startpointId',
  //   startpointId,
  //   'endpointId',
  //   endpointId,
  // );

  return (
    <div>
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

        <SaveTourForm
          routeId={routeId}
          userId={userId}
          startpointId={startpointId}
          endpointId={endpointId}
        />
        {/* <SaveButtonForm
          routeId={10}
          userId={4}
          startpointId={6}
          endpointId={6}
        /> */}
        <div>?</div>

        <div>Elevation? {/* <RoadElevationChart /> */}</div>
      </div>

      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    </div>
  );
}
