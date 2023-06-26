import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Data } from '../util/Data';
import LineChart from './LineChart';

Chart.register(CategoryScale);

export default function App() {
  const [chartData, setChartData] = useState({
    labels: Data.map((data) => data.year),
    datasets: [
      {
        label: 'Users Gained',
        data: Data.map((data) => data.userGain),
        backgroundColor: [
          'rgba(75, 192, 192, 1)',
          '#ecf0f1',
          '#50AF95',
          '#f3ba2f',
          '#2a71d0',
        ],
        borderColor: 'black',
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        labels: Data.map((data) => data.distance),
        datasets: [
          {
            label: 'Users Gained',
            data: Data.map((data) => getRandomNumber()),
            backgroundColor: ['#2a71d0'],
            borderColor: 'black',
            borderWidth: 2,
          },
        ],
      };

      setChartData(newData);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="App">
      <LineChart chartData={chartData} />
    </div>
  );
}

function getRandomNumber() {
  return Math.floor(Math.random() * 20);
}

// const RoadElevationChart = () => {
//   const heights = [10, 20, 15, 30, 25, 40, 35];
//   const indexes = heights.map((value, index) => index);
//   const chartData = {
//     labels: indexes,
//     datasets: [
//       {
//         label: 'Высота дороги',
//         data: heights,
//         fill: false,
//       },
//     ],
//   };
//   const chartOptions = {
//     responsive: true,
//     scales: {
//       x: {
//         type: 'linear',
//         display: true,
//         title: {
//           display: true,
//           text: 'Индексы точек',
//         },
//       },
//       y: {
//         display: true,
//         title: {
//           display: true,
//           text: 'Высота дороги (м)',
//         },
//         min: 0, // Минимальное значение для оси Y
//       },
//     },
//   };
//   return <Line data={chartData} options={chartOptions} />;
// };

// export default RoadElevationChart;
