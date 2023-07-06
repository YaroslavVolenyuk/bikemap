import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale);

const RoadElevationChart = ({ distance, elevation }) => {
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
    scales: {
      x: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Distance',
        },
        ticks: {
          offset: true,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Height',
        },
        ticks: {
          offset: true,
        },
        min: 0,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default RoadElevationChart;
