import React, { useState } from 'react';
import AddAndRemoveMarker from './AddAndRemoveMarker';
import RoutingMachine from './RoutineMachine';

export default function App() {
  const [coordinates, setCoordinates] = useState([]);

  const handleCoordinatesChange = (coords) => {
    setCoordinates(coords);
  };

  return (
    <div>
      <AddAndRemoveMarker onCoordinatesChange={handleCoordinatesChange} />
      <RoutingMachine waypoints={coordinates} />
    </div>
  );
}
