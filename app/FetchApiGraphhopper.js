import React, { useEffect, useState } from 'react';
import turf from 'turf';

const FetchApiGraphhopper = ({
  startingPlace,
  destination,
  setDistance,
  setElevation,
}) => {
  const [data, setData] = useState(null);
  const [uniqueCoverages, setUniqueCoverages] = useState([]);
  const [error, setError] = useState(null);

  const filterCoverages = (dataAPI) => {
    if (dataAPI && dataAPI.paths && dataAPI.paths.length > 0) {
      const details = dataAPI.paths[0].details;

      const coverages = details.surface || [];
      const uniqCoverages = [
        ...new Set(coverages.map((coverage) => coverage[2])),
      ].filter((coverage) => coverage !== 'missing');
      setUniqueCoverages(uniqCoverages);
    }
  };

  const fetchData = () => {
    fetch(
      `https://graphhopper.com/api/1/route?point=${startingPlace[1]},${startingPlace[0]}&point=${destination[1]},${destination[0]}&profile=bike&points_encoded=false&details=road_class&details=surface&locale=de&elevation=true&key=fa98aa5b-16af-4242-af72-7ef45d5a215e`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((dataAPI) => {
        setData(dataAPI);
        filterCoverages(dataAPI);

        if (
          dataAPI.paths &&
          dataAPI.paths[0] &&
          dataAPI.paths[0].instructions
        ) {
          const calculateDistances = (fetchedCoord) => {
            const calculateDistances = [];

            for (let i = 0; i < fetchedCoord.length - 1; i++) {
              const coord1 = fetchedCoord[i];
              const coord2 = fetchedCoord[i + 1];

              const point1 = turf.point([coord1[0], coord1[1]]);
              const point2 = turf.point([coord2[0], coord2[1]]);

              const distanceToTurf = turf.distance(point1, point2);
              calculateDistances.push(distanceToTurf * 1000);
            }

            return calculateDistances;
          };

          const distancesToUpdate = calculateDistances(
            dataAPI.paths[0].points.coordinates,
          );
          setDistance(distancesToUpdate);

          const savedElevation = dataAPI.paths[0].points.coordinates.map(
            (point) => point[2],
          );
          setElevation(savedElevation);
        }
      })
      .catch((error) => {
        setError(error);
      });
  };
  useEffect(() => {
    fetchData();
  }, [startingPlace, destination]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 50000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      {data ? (
        <div>
          <p>Up: {Math.floor(data.paths[0].ascend)} meters</p>
          <p>Down: {Math.floor(data.paths[0].descend)} meters</p>
          <p>Distance: {Math.floor(data.paths[0].distance)} meters</p>
          <p>Time: {Math.floor(data.paths[0].time / 1000 / 60)} min</p>

          {uniqueCoverages.length > 0 && (
            <div>
              <form>
                <h4>Path types:</h4>
                <ul>
                  {uniqueCoverages.map((coverage, index) => (
                    <li key={index}>{coverage}</li>
                  ))}
                </ul>
                <button>Save the tour</button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p>Start planning your journey</p>
      )}
    </div>
  );
};

export default FetchApiGraphhopper;
