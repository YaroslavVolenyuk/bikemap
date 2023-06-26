import { Marker, Popup, useMapEvents } from 'react-leaflet';

export default function AddAndRemoveMarker({ coord, setCoord }) {
  useMapEvents({
    click: (e) => {
      const newCoord = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
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
          draggable={false}
          eventHandlers={{
            click: (e) => {
              console.log('latlng: ', e.latlng, idx);
            },
            move: (e) => {
              updateMovedMarker(e.target.getLatLng(), idx);
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
