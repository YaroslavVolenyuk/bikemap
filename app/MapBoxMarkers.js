// import React, { useEffect, useState } from 'react';
// import Map, { Marker } from 'react-map-gl';

// const MapBoxMarkers = () => {
//   const [markers, setMarkers] = useState([]);
//   const [viewport, setViewport] = useState({
//     latitude: 48.2082,
//     longitude: 16.3738,
//     zoom: 12,
//   });

//   const handleMapClick = (event) => {
//     const newMarker = {
//       id: Math.random().toString(36).substr(2, 9),
//       coordinates: [event.lngLat[0], event.lngLat[1]],
//     };

//     setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
//   };

//   return (
//     <>
//       {markers.map((marker) => (
//         <div key={marker.id}>
//           <span>Маркер: {marker.coordinates.join(', ')}</span>
//         </div>
//       ))}
//       <Map
//         {...viewport}
//         width="100%"
//         height="400px"
//         onViewportChange={setViewport}
//         mapboxApiAccessToken="pk.eyJ1IjoieXJvYWNoIiwiYSI6ImNsaXJoZ2hrcjEyb28zZW8xOWoxOGphOGYifQ.-ZVzkyZ63Y6jlkvIQq4tQw"
//         onClick={handleMapClick}
//       >
//         {markers.map((marker) => (
//           <Marker
//             key={marker.id}
//             latitude={marker.coordinates[1]}
//             longitude={marker.coordinates[0]}
//           >
//             <div className="marker">Маркер</div>
//           </Marker>
//         ))}
//       </Map>
//     </>
//   );
// };

// export default MapBoxMarkers;
