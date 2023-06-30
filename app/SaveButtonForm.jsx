'use client';

// async function postRouteToAPI({ routeId, userId, startpointId, endpointId }) {
//   const response = await fetch('/api/routes', {
//     method: 'POST',
//     body: JSON.stringify({
//       routeId,
//       userId,
//       startpointId,
//       endpointId,
//     }),
//   });

//   const data = await response.json();
//   console.log('data SaveButtonComponent:', data);

//   // setRouteList([...animalList, data.animal]);
//   }

async function postRouteToAPI({ routeId, userId, startpointId, endpointId }) {
  try {
    const response = await fetch('http://localhost:3000/api/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Data:', data);
      // Дополнительная логика обработки успешного ответа от сервера
    } else {
      console.log('Request failed with status:', response.status);
      // Дополнительная логика обработки ошибки сервера
    }
  } catch (error) {
    console.log('Request failed:', error);
    // Дополнительная логика обработки ошибки
  }
  // }

  // async function postData({ routeId, userId, startpointId, endpointId }) {
  //   try {
  //     const response = await fetch(`/api/routes/${userId}`, {
  //       method: 'POST',
  //       body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
  //     });
  //     if (response.status !== 500) {
  //       const data = await response.json();
  //       if ('error' in data) {
  //         console.log(data.error);
  //       }
  //       if ('user' in data) {
  //         console.log(data.user);
  //       }
  //     }
  //   } catch (e) {
  //     console.log({ e });
  //   }
  // }

  // export default async function SaveButtonForm({
  //   routeId,
  //   userId,
  //   startpointId,
  //   endpointId,
  // }) {
  //   try {
  //     const response = await fetch(`/api/routes/`, {
  //       method: 'POST',
  //       body: JSON.stringify({ routeId, userId, startpointId, endpointId }),
  //     });
  //     if (response.status !== 500) {
  //       const data = await response.json();
  //       if ('error' in data) {
  //         console.log(data.error);
  //       }
  //       if ('user' in data) {
  //         console.log(data.user);
  //       }
  //     }
  //   } catch (error) {
  //     console.log({ error });
  //   }

  return (
    <div>
      <button
      // onClick={async () =>
      //   await console.log({ userId, routeId, startpointId, endpointId })
      // }
      // onClick={async () => {
      //   await postData({ userId, routeId, startpointId, endpointId });
      // }}
      >
        SaveButtonForm (!)
      </button>
      <button
      // onClick={async () =>
      //   await postRouteToAPI({ routeId, userId, startpointId, endpointId })
      // }
      >
        send Data
      </button>
    </div>
  );
}

// export default async function UserID() {
//   const cookieStore = cookies();
//   const sessionToken = cookieStore.get('sessionToken');
//   const user = !sessionToken?.value
//     ? undefined
//     : await getUserBySessionToken(sessionToken.value);
//   if (!user) {
//     notFound();
//   }
//   const userId = user.id;
//   console.log(userId);
// }
