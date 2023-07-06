import { useRouter } from 'next/router';
import { useState } from 'react';

export default function SaveTourForm({
  routeId,
  userId,
  startpointLat,
  startpointLng,
  endpointLat,
  endpointLng,
}) {
  const [error, setError] = useState('');

  async function saveRouteToUser() {
    try {
      const response = await fetch('/api/routes/saveroute', {
        method: 'POST',
        body: JSON.stringify({
          routeId,
          userId,
          startpointLat,
          startpointLng,
          endpointLat,
          endpointLng,
        }),
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
