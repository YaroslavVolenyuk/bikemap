import {
  Clock4,
  MoveDownRight,
  MoveHorizontal,
  MoveUpRight,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AiOutlineProfile } from 'react-icons/ai';
import {
  FaCity,
  FaCubes,
  FaExclamationTriangle,
  FaMountain,
  FaRoad,
  FaSquare,
  FaTree,
} from 'react-icons/fa';
import { GiGrass, GiPathDistance, GiStoneWall } from 'react-icons/gi';
import turf from 'turf';
import styles from './homepage.module.scss';

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

  const getCoverageIcon = (coverage) => {
    switch (coverage) {
      case 'asphalt':
        return <FaRoad />;
      case 'paved':
        return <GiStoneWall />;
      case 'concrete':
        return <FaCity />;
      case 'wood':
        return <FaTree />;
      case 'gravel':
        return <FaMountain />;
      case 'fine_gravel':
        return <FaMountain />;
      case 'ground':
        return <FaMountain />;
      case 'compacted':
        return <FaSquare />;
      case 'paving_stones':
        return <GiStoneWall />;
      case 'cobblestone':
        return <FaCubes />;
      case 'unpaved':
        return <FaExclamationTriangle />;
      case 'dirt':
        return <FaExclamationTriangle />;
      case 'grass':
        return <GiGrass />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.tripInfo}>
      {data ? (
        <div>
          <div className={styles.roadProfile}>
            <h4 className={styles.fakeBackground}>
              <AiOutlineProfile />
              Road profile:
            </h4>
            <p className={styles.buttonLikeBackground}>
              <MoveUpRight width={20} height={20} />{' '}
              {Math.floor(data.paths[0].ascend)} m
            </p>
            <p className={styles.buttonLikeBackground}>
              {' '}
              <MoveDownRight width={20} height={20} />{' '}
              {Math.floor(data.paths[0].descend)} m
            </p>
            <p className={styles.buttonLikeBackground}>
              {' '}
              <MoveHorizontal width={20} height={20} />{' '}
              {Math.floor(data.paths[0].distance)} m
            </p>
            <p className={styles.buttonLikeBackground}>
              {' '}
              <Clock4 width={20} height={20} />{' '}
              {Math.floor(data.paths[0].time / 1000 / 60)} min
            </p>
          </div>

          {uniqueCoverages.length > 0 && (
            <div className={styles.pathType}>
              <form>
                <ul className={styles.fakeBackground}>
                  <GiPathDistance /> Path types:
                  {uniqueCoverages.map((coverage, index) => (
                    <li className={styles.list} key={index}>
                      {getCoverageIcon(coverage)} {coverage}
                    </li>
                  ))}
                </ul>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p className={styles.staredText}>
          Start planning your journey. Select point A and point B to create a
          route, calculate the distance, and get detailed information about the
          planned route.
        </p>
      )}
    </div>
  );
};

export default FetchApiGraphhopper;
