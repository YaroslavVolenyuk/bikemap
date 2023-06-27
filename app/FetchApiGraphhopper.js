import React, { useEffect, useState } from 'react';

const FetchAPI = ({ startingPlace, destination }) => {
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
      })
      .catch((error) => {
        setError(error);
      });

    console.log(
      'API request: ',
      `https://graphhopper.com/api/1/route?point=${startingPlace[1]},${startingPlace[0]}&point=${destination[1]},${destination[0]}&profile=bike&points_encoded=false&details=road_class&details=surface&locale=de&elevation=true&key=fa98aa5b-16af-4242-af72-7ef45d5a215e`,
    );
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

  // useEffect(() => {
  //   if (data) {
  //     onDataDistance(data.paths[0].instructions[0].distance);
  //     onDataElevation(data.paths[0].instructions[0].distance);
  //   } else {
  //     console.log('FetchAPI PROPS data: no data yet');
  //   }
  // }, [data, onDataDistance, onDataElevation]);

  //

  // console.log(
  //   'данные об отрезках',
  //   data ? data.paths[0].instructions[0].distance : 'no data',
  // );
  // console.log(
  //   'данные о координатах',
  //   data ? data.paths[0].points.coordinates[0][2] : 'no data',
  // );

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
              <h4>Path types:</h4>
              <ul>
                {uniqueCoverages.map((coverage, index) => (
                  <li key={index}>{coverage}</li>
                ))}
              </ul>
              <button>Save the tour</button>
            </div>
          )}
        </div>
      ) : (
        <p>Start planning your journey</p>
      )}
    </div>
  );
};

export default FetchAPI;
