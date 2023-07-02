import { useRouter } from 'next/router';
import { useState } from 'react';

export default function SaveTourForm({
  routeId,
  userId,
  startpointId,
  endpointId,
}) {
  const [error, setError] = useState('');

  async function saveRouteToUser() {
    try {
      const response = await fetch('/api/routes/saveroute', {
        method: 'POST',
        body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
      });

      const data = await response.json();

      if ('error' in data) {
        setError(data.error);
        return;
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while saving the route.');
    }
  }

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <button onClick={saveRouteToUser}>Save the route Button</button>
    </form>
  );
}

// // 'use client';

// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { RegisterResponseBodyPost } from './api/routes/saveroute/route';

// export default function SaveTourForm({
//   routeId,
//   userId,
//   startpointId,
//   endpointId,
// }) {
//   const [error, setError] = useState('');
//   const router = useRouter();

//   async function saveRouteToUser() {
//     const response = await fetch('/api/routes/saveroute', {
//       method: 'POST',
//       body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
//     });

//     const data = await response.json();
//     // const data: RegisterResponseBodyPost = await response.json();

//     // console.log('data test? ', data);

//     if ('error' in data) {
//       setError(data.error);
//       return;
//     }

//     router.refresh();
//   }

//   return (
//     <form onSubmit={(event) => event.preventDefault()}>
//       <button onClick={async () => await saveRouteToUser()}>save button</button>
//     </form>
//   );
// }

// // async function postRouteToAPI({ routeId, userId, startpointId, endpointId }) {
// //   const response = await fetch('/api/routes', {
// //     method: 'POST',
// //     body: JSON.stringify({
// //       routeId,
// //       userId,
// //       startpointId,
// //       endpointId,
// //     }),
// //   });

// //   const data = await response.json();
// //   console.log('data SaveButtonComponent:', data);

// //   // setRouteList([...animalList, data.animal]);
// //   }

// async function postRouteToAPI({ routeId, userId, startpointId, endpointId }) {
//   try {
//     const response = await fetch('http://localhost:3000/api/routes', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log('Data:', data);
//       // Дополнительная логика обработки успешного ответа от сервера
//     } else {
//       console.log('Request failed with status:', response.status);
//       // Дополнительная логика обработки ошибки сервера
//     }
//   } catch (error) {
//     console.log('Request failed:', error);
//     // Дополнительная логика обработки ошибки
//   }
//   // }

//   // async function postData({ routeId, userId, startpointId, endpointId }) {
//   //   try {
//   //     const response = await fetch(`/api/routes/${userId}`, {
//   //       method: 'POST',
//   //       body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
//   //     });
//   //     if (response.status !== 500) {
//   //       const data = await response.json();
//   //       if ('error' in data) {
//   //         console.log(data.error);
//   //       }
//   //       if ('user' in data) {
//   //         console.log(data.user);
//   //       }
//   //     }
//   //   } catch (e) {
//   //     console.log({ e });
//   //   }
//   // }

//   // export default async function SaveButtonForm({
//   //   routeId,
//   //   userId,
//   //   startpointId,
//   //   endpointId,
//   // }) {
//   //   try {
//   //     const response = await fetch(`/api/routes/`, {
//   //       method: 'POST',
//   //       body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
//   //     });
//   //     if (response.status !== 500) {
//   //       const data = await response.json();
//   //       if ('error' in data) {
//   //         console.log(data.error);
//   //       }
//   //       if ('user' in data) {
//   //         console.log(data.user);
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.log({ error });
//   //   }

//   return (
//     <div>
//       <button
//       // onClick={async () =>
//       //   await console.log({ userId, routeId, startpointId, endpointId })
//       // }
//       // onClick={async () => {
//       //   await postData({ userId, routeId, startpointId, endpointId });
//       // }}
//       >
//         SaveButtonForm (!)
//       </button>
//       <button
//       // onClick={async () =>
//       //   await postRouteToAPI({ routeId, userId, startpointId, endpointId })
//       // }
//       >
//         send Data
//       </button>
//     </div>
//   );
// }

// // export default async function UserID() {
// //   const cookieStore = cookies();
// //   const sessionToken = cookieStore.get('sessionToken');
// //   const user = !sessionToken?.value
// //     ? undefined
// //     : await getUserBySessionToken(sessionToken.value);
// //   if (!user) {
// //     notFound();
// //   }
// //   const userId = user.id;
// //   console.log(userId);
// // }
