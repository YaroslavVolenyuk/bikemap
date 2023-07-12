// // 'use client';

// import { useState } from 'react';

// export default function LoadUserMaps() {
//   const [error, setError] = useState('');

//   async function loadUserRoute() {
//     try {
//       const response = await fetch('/api/routes/saveroute', {
//         method: 'POST',
//       });

//       const data = await response.json();

//       if ('error' in data) {
//         setError(data.error);
//         return;
//       }
//     } catch (error) {
//       console.error(error);
//       setError('An error occurred while saving the route.');
//     }
//   }

//   return (
//     <form onSubmit={(event) => event.preventDefault()}>
//       <button onClick={loadUserRoute}>load the user coord:</button>
//     </form>
//   );
// }

// // import axios from 'axios';
// // import { useEffect, useState } from 'react';

// // export default async function LoadUserMaps() {
// //   const [coordinates, setCoordinates] = useState([]);
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const response = await axios.get('/api/routes/saveroute');
// //         setCoordinates(response.data);
// //         console.log('response GET', response);
// //       } catch (error) {
// //         console.error('Ошибка при получении данных:', error);
// //       }
// //     };

// //     fetchData();
// //   }, []);
// //   return (
// //     <div>
// //       {coordinates.map((coordinate, index) => (
// //         <div key={index}>
// //           {coordinate.startpoint_lat}, {coordinate.startpoint_lng},{' '}
// //           {coordinate.endpoint_lat}, {coordinate.endpoint_lng}
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }
