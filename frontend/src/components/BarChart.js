import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ month }) => {
  const [chartData, setChartData] = useState(null);

  const fetchBarChartData = async (month) => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/barchart', { params: { month } });
      console.log(response.data);

      const maxCount = Math.max(...response.data.data);

      setChartData({
        labels: response.data.labels,
        datasets: [
          {
            label: 'Total Items',
            data: response.data.data,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
            hoverBorderColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      });

      setOptions((prevOptions) => ({
        ...prevOptions,
        scales: {
          y: {
            beginAtZero: true,
            max: maxCount + 5, // Set max value based on the max count, add a buffer
            stepSize: 10, // Adjust this value to set the interval between tick marks
          },
        },
      }));
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  const [options, setOptions] = useState({
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  });

  useEffect(() => {
    if (month) {
      fetchBarChartData(month);
    }
  }, [month]);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bar-chart-container p-4 border rounded-md shadow-md bg-yellow-100 max-w-4xl mx-auto mt-8">
      <h2 className="text-3xl text-center font-bold mb-4">Bar Chart for {month}</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
