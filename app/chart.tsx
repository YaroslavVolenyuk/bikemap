import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import React from 'react';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale);

type Props = {
  distance: number[];
  elevation: number[];
};

const RoadElevationChart = ({ distance, elevation }: Props) => {
  const distTransformed = distance.map((value, index) => {
    if (index === 0) {
      return value;
    } else {
      const previousSum = distance
        .slice(0, index)
        .reduce((sum, num) => sum + num, 0);
      return previousSum + value;
    }
  });

  const chartData = {
    labels: distTransformed,
    datasets: [
      {
        label: 'Road elevation',
        data: elevation,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        display: true,
        title: {
          display: false,
          text: 'Distance',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Height',
        },
        min: 0,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default RoadElevationChart;
