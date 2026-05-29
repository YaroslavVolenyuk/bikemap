'use client';

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

type GraphhopperCoverage = [number, number, string];

type GraphhopperApiResponse = {
  paths?: Array<{
    ascend: number;
    descend: number;
    distance: number;
    time: number;
    instructions?: unknown[];
    points: {
      coordinates: Array<[number, number, number]>;
    };
    details: {
      surface?: GraphhopperCoverage[];
    };
  }>;
};

type Props = {
  startingPlace: [number, number];
  destination: [number, number];
  setDistance: (distances: number[]) => void;
  setElevation: (elevations: number[]) => void;
};

const FetchApiGraphhopper = ({
  startingPlace,
  destination,
  setDistance,
  setElevation,
}: Props) => {
  const [data, setData] = useState<GraphhopperApiResponse | null>(null);
  const [uniqueCoverages, setUniqueCoverages] = useState<string[]>([]);
  console.log('uniqueCoverages', uniqueCoverages);

  const filterCoverages = (dataAPI: GraphhopperApiResponse) => {
    if (dataAPI?.paths && dataAPI.paths.length > 0) {
      const details = dataAPI.paths[0]!.details;

      const coverages = details.surface ?? [];
      console.log('coverages', coverages);
      const uniqCoverages = [
        ...new Set(coverages.map((coverage) => coverage[2])),
      ].filter((coverage) => coverage !== 'missing');
      setUniqueCoverages(uniqCoverages);
    }
  };

  const fetchData = () => {
    const url = `/api/routes/details?startLat=${startingPlace[1]}&startLng=${startingPlace[0]}&endLat=${destination[1]}&endLng=${destination[0]}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json() as Promise<GraphhopperApiResponse>;
      })
      .then((dataAPI) => {
        setData(dataAPI);
        filterCoverages(dataAPI);

        const path = dataAPI.paths?.[0];
        if (path?.instructions) {
          const calculateDistances = (
            fetchedCoord: Array<[number, number, number]>,
          ): number[] => {
            const distances: number[] = [];

            for (let i = 0; i < fetchedCoord.length - 1; i++) {
              const coord1 = fetchedCoord[i]!;
              const coord2 = fetchedCoord[i + 1]!;

              const point1 = turf.point([coord1[0], coord1[1]]);
              const point2 = turf.point([coord2[0], coord2[1]]);

              const distanceToTurf = turf.distance(point1, point2);
              distances.push(distanceToTurf * 1000);
            }

            return distances;
          };

          const distancesToUpdate = calculateDistances(
            path.points.coordinates,
          );
          setDistance(distancesToUpdate);

          const savedElevation = path.points.coordinates.map(
            (point) => point[2],
          );
          setElevation(savedElevation);
        }
      })
      .catch((error: unknown) => {
        console.error('FetchApiGraphhopper error:', error);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startingPlace, destination]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 50000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCoverageIcon = (coverage: string) => {
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
              {Math.floor(data.paths![0]!.ascend)} m
            </p>
            <p className={styles.buttonLikeBackground}>
              {' '}
              <MoveDownRight width={20} height={20} />{' '}
              {Math.floor(data.paths![0]!.descend)} m
            </p>
            <p className={styles.buttonLikeBackground}>
              {' '}
              <MoveHorizontal width={20} height={20} />{' '}
              {Math.floor(data.paths![0]!.distance)} m
            </p>
            <p className={styles.buttonLikeBackground}>
              {' '}
              <Clock4 width={20} height={20} />{' '}
              {Math.floor(data.paths![0]!.time / 1000 / 60)} min
            </p>
          </div>

          {uniqueCoverages.length > 0 && (
            <div className={styles.pathType}>
              <ul className={styles.fakeBackground}>
                <GiPathDistance /> Path types:
                {uniqueCoverages.map((coverage) => (
                  <li className={styles.list} key={coverage}>
                    {getCoverageIcon(coverage)} {coverage}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.staredText}>
          <p>How to start planning your journey:</p>
          <p>
            Select point A and point B to create a route, calculate the
            distance, and get detailed information about the planned route:
          </p>

          <p>
            1. click on the map to enter a departure point or enter a name in
            the input field.
          </p>

          <p>
            2. click on the map to enter the destination point or enter a name
            in the input field.{' '}
          </p>

          <p>
            3. to change the route, move point A or B to the desired location by
            dragging.
          </p>
        </div>
      )}
    </div>
  );
};

export default FetchApiGraphhopper;
