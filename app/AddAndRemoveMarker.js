import { useEffect, useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';

// https://codesandbox.io/s/react-leaflet-v-3-x-removing-marker-6xrjv?file=/src/AddMarker.jsx:0-944

export default function AddAndRemoveMarker({ coord, setCoord }) {
  console.log('coords AddAndRemoveMarker:', coord);
  useMapEvents({
    click: (e) => {
      const newCoord = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      // setCoord([...coord, newCoord]);
      setCoord((prevCoord) => [...prevCoord, newCoord]);
    },
  });

  const removeMarker = (pos) => {
    setCoord((prevCoord) =>
      prevCoord.filter(
        (coordinate) =>
          coordinate.lat !== pos.lat || coordinate.lng !== pos.lng,
      ),
    );
  };

  // const updateMovedMarker = (pos) => {
  //   setCoord((prevCoord) =>
  //     prevCoord.map((coordinate, index) => (index === idx ? pos : coordinate)),
  //   );
  // };

  // const updateMovedMarker = (e) => {
  //   const { lat, lng } = e.target.getLatLng();
  //   // setCoord([lat, lng]);
  //   console.log({ lat, lng });
  // };

  const updateMovedMarker = (pos, idx) => {
    const { lat, lng } = pos;
    setCoord((prevCoord) =>
      prevCoord.map((coordinate, index) =>
        index === idx ? { lat, lng } : coordinate,
      ),
    );
  };

  return (
    <div>
      {coord.map((pos, idx) => (
        <Marker
          key={`marker-${idx}`}
          position={pos}
          draggable={true}
          eventHandlers={{
            click: (e) => {
              console.log('latlng: ', e.latlng, idx);
            },
            move: (e) => {
              updateMovedMarker(e.target.getLatLng(), idx);
              // console.log(e.target.getLatLng(), idx);
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
