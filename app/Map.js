import L from 'leaflet';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import AddAndRemoveMarker from './AddAndRemoveMarker';
import RoutineMachine from './RoutineMachine';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: './images/leaflet/marker-icon.png',
  shadowUrl: './images/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapComponent() {
  const [firstCoordinates, setFirstCoordinates] = useState({
    lat: 48.2082,
    lng: 16.3738,
  });

  const defaultPosition = {
    latAndLng: [firstCoordinates.lat, firstCoordinates.lng],

    zoom: 5,
  };

  const [waypoints, setWaypoints] = useState([]);

  const handleCoordinatesChange = useCallback((coordinates) => {
    setWaypoints(coordinates);
  }, []);

  return (
    <MapContainer
      center={defaultPosition.latAndLng}
      zoom={defaultPosition.zoom}
      style={{ height: '400px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
      />
      <RoutineMachine waypoints={waypoints} />
      <AddAndRemoveMarker onCoordinatesChange={handleCoordinatesChange} />
    </MapContainer>
  );
}

export default MapComponent;
