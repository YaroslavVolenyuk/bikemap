import type { ChartData } from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

type Props = {
  chartData: ChartData<'line'>;
};

function LineChart({ chartData }: Props) {
  return (
    <div className="chart-container">
      <Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: 'The elevation profile',
            },
            legend: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
}
export default LineChart;
