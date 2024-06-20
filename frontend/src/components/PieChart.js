import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const PieChart = ({ month }) => {
  const [chartData, setChartData] = useState(null);

  const fetchPieChartData = async (month) => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/piechart', { params: { month } });
      // console.log(response.data);
  
      const transformedData = response.data.map(item => ({
        label: item.category,  // Use category as label
        data: item.count,      // Use count as data value
      }));
  
      setChartData({
        labels: transformedData.map(item => item.label),
        datasets: [
          {
            data: transformedData.map(item => item.data),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    }
  };
  
  useEffect(() => {
    if (month) {
      fetchPieChartData(month);
    }
  }, [month]);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  const options = {
    // maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <div className="pie-chart-container p-4 border rounded-md shadow-md max-h-screen bg-yellow-100 max-w-4xl mx-auto mt-8 pb-20 " >
      <h2 className="text-3xl text-center font-bold mb-4">Pie Chart</h2>
      <div className='justify-center items-center flex mt-4' style={{ height: '400px' }}>

      <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
