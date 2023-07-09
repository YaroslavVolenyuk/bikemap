'use client';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LogIn, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import RoadElevationChart from './chart';
import FetchApiGraphhopper from './FetchApiGraphhopper';
import styles from './homepage.module.scss';
import MapBoxRouting from './MapBoxRouting';
import SaveTourForm from './SaveButtonForm';

// the main component

type Props = {
  userId: number;
  username: string;
};

export default function HomePage({ userId, username }) {
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
    <div className={styles.background}>
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

        {userId ? (
          <Link className={styles.profileIcon} href={`/profile/${username}`}>
            <User width={25} height={25} /> Profile
          </Link>
        ) : (
          <div className={styles.loginRegisterIcon}>
            <LogIn width={25} height={25} />{' '}
            <Link href={`/login`}> Sign in</Link>
            /
            <UserPlus width={25} height={25} />{' '}
            <Link href={`/register`}> Sign up</Link>
          </div>
        )}

        <div>
          {userId && startingPlace && endpointLat ? (
            <div className={styles.elevationChart}>
              <p className={styles.fakeBackground}> Elevation profile:</p>{' '}
              <RoadElevationChart elevation={elevation} distance={distance} />{' '}
            </div>
          ) : null}
        </div>

        <div>
          <FetchApiGraphhopper
            startingPlace={startingPlace}
            destination={destination}
            setElevation={setElevation}
            setDistance={setDistance}
          />
        </div>

        {userId ? (
          <SaveTourForm
            routeId={routeId}
            userId={userId}
            startpointLat={startpointLat}
            startpointLng={startpointLng}
            endpointLat={endpointLat}
            endpointLng={endpointLng}
          />
        ) : null}
      </div>

      <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    </div>
  );
}
