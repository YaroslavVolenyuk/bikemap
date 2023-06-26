import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import mapboxgl from 'mapbox-gl';
import React, { useEffect, useState } from 'react';
import RoadElevationChart from './chart';
import FetchAPI from './FetchAPI';

mapboxgl.accessToken =
  'pk.eyJ1IjoieXJvYWNoIiwiYSI6ImNsaXJoZ2hrcjEyb28zZW8xOWoxOGphOGYifQ.-ZVzkyZ63Y6jlkvIQq4tQw';
const MapBoxRouting = () => {
  // const [startPoint, setStartPoint] = useState('');
  // const [endPoint, setEndPoint] = useState('');

  const [startingPlace, setStartingPlace] = useState('');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [16.3738, 48.2082], // vienna
      zoom: 13,
    });

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      alternatives: true,
      profile: 'mapbox/cycling',
      steps: true,
      geometries: 'polyline',

      controls: {
        inputs: true,
        instructions: false,
        profileSwitcher: false, // aчйuto bikes peeps
        waypointNameMarkers: true,
        reverseGeocode: true,
        clearButton: true,
        interactive: true,
      },
    });

    map.addControl(directions);

    directions.on('route', (e) => {
      const routes = e.route;
      if (routes && routes.length > 0) {
        const startingPlace = routes[0].legs[0].steps[0].maneuver.location;
        const destination =
          routes[0].legs[routes[0].legs.length - 1].steps[
            routes[0].legs[routes[0].legs.length - 1].steps.length - 1
          ].maneuver.location;

        setStartingPlace(startingPlace);
        console.log('Starting Place:', startingPlace);

        setDestination(destination);
        console.log('Destination:', destination);
      }
    });

    directions.on('route', (e) => {
      const waypoints = directions.getWaypoints();
      console.log('waypoints', waypoints);
    });

    return () => map.remove();
  }, []);

  // const handleStartPointChange = (e) => {
  //   setStartPoint(e.target.value);
  // };

  // const handleEndPointChange = (e) => {
  //   setEndPoint(e.target.value);
  // };

  // const handleGoClick = () => {
  //   const directions = new MapboxDirections({
  //     accessToken: mapboxgl.accessToken,
  //     unit: 'metric',
  //     alternatives: true,
  //     profile: 'mapbox/cycling',
  //     steps: true,
  //     geometries: 'polyline',

  //     controls: {
  //       inputs: false, // Отключение встроенного интерфейса ввода
  //     },
  //   });

  //   directions.setOrigin(startPoint);
  //   directions.setDestination(endPoint);
  // };

  const apiKey = 'fa98aa5b-16af-4242-af72-7ef45d5a215e';

  // const url = `https://graphhopper.com/api/1/route?point=48.2082,16.3738&point=48.224,3.867&profile=bike&locale=de&elevation=true&key=fa98aa5b-16af-4242-af72-7ef45d5a215e`;

  // https://graphhopper.com/api/1/route?point=48.2082,16.3738&point=48.4082,16.4738&profile=bike&points_encoded=false&locale=de&elevation=true&key=fa98aa5b-16af-4242-af72-7ef45d5a215e

  // fetch(url)
  //   .then((response) => response.json())
  //   .then((data) => {
  //     // Обработка полученных данных
  //     console.log(data);
  //   })
  //   .catch((error) => {
  //     // Обработка ошибок
  //     console.error(error);
  //   });

  return (
    <div>
      <div id="map" style={{ height: '400px' }}></div>

      <div>
        <FetchAPI startingPlace={startingPlace} destination={destination} />
      </div>
      <div>
        {' '}
        <RoadElevationChart />
      </div>
    </div>
  );
};

export default MapBoxRouting;
