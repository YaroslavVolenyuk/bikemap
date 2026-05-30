import { useState } from 'react';
import styles from './homepage.module.scss';

type Props = {
  routeId: number;
  userId: number;
  startpointLat?: number;
  startpointLng?: number;
  endpointLat?: number;
  endpointLng?: number;
};

export default function SaveTourForm({
  routeId,
  userId,
  startpointLat,
  startpointLng,
  endpointLat,
  endpointLng,
}: Props) {
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

      const data = (await response.json()) as Record<string, unknown>;

      if ('error' in data) {
        setError(String(data['error']));
        return;
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving the route.');
    }
  }

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      {error && <p>{error}</p>}
      <div className={styles.centeredElements}>
        {startpointLat && endpointLat ? (
          <button className={styles.saveRouteButton} onClick={saveRouteToUser}>
            Save your route
          </button>
        ) : null}
      </div>
    </form>
  );
}
