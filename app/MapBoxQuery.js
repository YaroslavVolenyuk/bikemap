import './styles.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
// API
import mapboxgl from 'mapbox-gl';
import React, { useEffect, useState } from 'react';
import { getTransportDifficulty } from './Function';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZW1pbGVwcm9zdCIsImEiOiJja3ZiMDE1OWMwOGIzMnZscXhweWtqMDM0In0.LhdLRZXtxuctf_ymLHz30w';

export default function App() {
  const [transportScore, setTransportScore] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [emmission, setEmmission] = useState(null);
  const [sinuosity, setSinuosity] = useState(null);
  const [roundabout, setRoundabout] = useState(null);
  const [roadPortion, setRoadPortion] = useState({
    motorwayPortion: null,
    mainRoadPortion: null,
    secondaryRoadPortion: null,
    otherPortion: null,
  });

  useEffect(() => {
    async function getRoute(start, end) {
      const steps = true;
      const alternatives = true;
      const geometries = 'polyline';
      const overview = 'full';
      const departAt = '2021-11-25T08:00';

      const [startLng, startLat] = start;
      const [endLng, endLat] = end;

      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startLng},${startLat};${endLng},${endLat}?steps=${steps}&alternatives=${alternatives}&geometries=${geometries}&overview=${overview}&depart_at=${departAt}&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' },
      );
      // request API
      const route = await query.json();
      if (route !== null) {
        console.log('API OK');
        console.log(route);
        const [
          score,
          duration,
          distance,
          emmission,
          sinuosity,
          roadPortion,
          roundabout,
        ] = getTransportDifficulty(route);

        setTransportScore(score);
        setDistance(distance);
        setDuration(duration);
        setEmmission(emmission);
        setSinuosity(sinuosity);
        setRoadPortion(roadPortion);
        setRoundabout(roundabout);
      }
    }
    const depart = [1.4260282516479492, 43.60942840576172];
    //const depart = [2.21, 46.23];
    //const destination = [1.4000839, 43.613263]
    const destination = [2.3435197, 48.8426449];
    getRoute(depart, destination);
  }, []);

  return (
    <div className="App">
      <h1>Pénibilité de Transport</h1>
      <p>score: {transportScore}</p>
      <p>distance: {distance} km</p>
      <p>temps: {duration} minutes</p>
      <p>emmission c02: {emmission}</p>
      <p>sinuosity: {sinuosity}</p>
      <p>roundabout: {roundabout}</p>
      <p>motorwayPortion: {roadPortion['motorwayPortion']}</p>
      <p>mainRoadPortion: {roadPortion['mainRoadPortion']}</p>
      <p>secondaryRoadPortion: {roadPortion['secondaryRoadPortion']}</p>
      <p>otherPortion: {roadPortion['otherPortion']}</p>
    </div>
  );
}
