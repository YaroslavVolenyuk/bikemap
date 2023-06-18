import { useEffect, useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';

// https://codesandbox.io/s/react-leaflet-v-3-x-removing-marker-6xrjv?file=/src/AddMarker.jsx:0-944

export default function AddAndRemoveMarker({ onCoordinatesChange }) {
  const [coord, setCoord] = useState([]);

  // console.log(typeof onCoordinatesChange, 'type');

  // useMapEvents({
  //   click: (e) => {
  //     setPosition([...coord, e.latlng]);
  //   },
  // });

  // useEffect(() => {}, [coord]);

  // useMapEvents({
  //   click: (e) => {
  //     setPosition((prevCoord) => [...prevCoord, e.latlng]);
  //   },
  // });

  useMapEvents({
    click: (e) => {
      const newCoord = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      setCoord((prevCoord) => [...prevCoord, newCoord]);
      onCoordinatesChange([...coord, newCoord]);
    },
  });

  const handleCoordinatesChange = (coordinates) => {
    setCoord(coordinates);
  };
  useEffect(() => {
    handleCoordinatesChange(coord);
  }, [coord, handleCoordinatesChange]);

  console.log('coord ADD AND REMOVE MARKER: ', coord);

  // const removeMarker = (pos) => {
  //   setCoord((prevCoord) =>
  //     prevCoord.filter(
  //       (coordinate) => JSON.stringify(coordinate) !== JSON.stringify(pos),
  //     ),
  //   );
  // };

  const removeMarker = (pos) => {
    const updatedCoord = coord.filter(
      (coordinate) => coordinate.lat !== pos.lat && coordinate.lng !== pos.lng,
    );
    setCoord(updatedCoord);
    onCoordinatesChange(updatedCoord);
  };

  console.log('coords:', coord);

  return (
    <div>
      {coord.map((pos, idx) => (
        <Marker
          key={`marker-${idx}`}
          position={pos}
          draggable={true}
          eventHandlers={{
            click: (e) => {
              console.log(e.latlng);
            },
          }}
        >
          <Popup>
            <button onClick={() => removeMarker(pos)}>Remove marker</button>
          </Popup>
        </Marker>
      ))}
    </div>
  );
}
