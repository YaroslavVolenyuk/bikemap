'use client';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import RoadElevationChart from './chart';
import FetchApiGraphhopper from './FetchApiGraphhopper';
import MapBoxRouting from './MapBoxRouting';
// import SaveButtonForm from './SaveButtonForm';
import GetAllRoutes from './TestButton';

// the main component

export default function HomePage({ userId }) {
  const [distance, setDistance] = useState([]);
  const [elevation, setElevation] = useState([]);

  const [startingPlace, setStartingPlace] = useState('');
  const [destination, setDestination] = useState('');

  const [savedUserPointA, setSavedUserPointA] = useState('');
  const [savedUserPointB, setSavedUserPointB] = useState('');

  const startpointId = Date.now();
  const endpointId = Date.now() + 1;
  const routeId = Date.now() + 10;

  // console.log(routeId);
  // console.log(startpointId);
  // console.log(endpointId);

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
