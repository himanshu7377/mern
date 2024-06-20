import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Combine = ({ month }) => {
  // State variables to hold data
  const [statistics, setStatistics] = useState({
    totalSalesAmount: 0,
    soldItems: 0,
    notSoldItems: 0,
    totalItemsCount: 0,
  });

  // console.log('month', month);

  const [barChartData, setBarChartData] = useState({
    labels: [],
    data: []
  });

  const [pieChartData, setPieChartData] = useState([]);

  // Function to fetch data based on month
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/combine', {
        params: {  month },
      });
      // console.log('API Response:', response.data);
      const { statistics, barChartData, pieChartData } = response.data;
      setStatistics(statistics);
      setBarChartData(barChartData);
      setPieChartData(pieChartData);
    } catch (error) {
      console.error('Error fetching combined data:', error);
    }
  };
  

  // Fetch data when month changes
  useEffect(() => {
    if (month) {
      fetchData(month);
    }
  }, [month]);

  return (
    <div className="combine-chart p-4 border rounded-md shadow-md bg-yellow-100 max-w-4xl mx-auto mt-8">
      <div>
        <h2 className="text-3xl text-center font-bold mb-4">Combined Statistics</h2>
      </div>
      <div className='grid grid-rows-2 gap-4'>
        {/* Statistics Section */}
        <div className="statistics">
          <h3 className="text-2xl text-center font-semibold mb-2">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-md bg-yellow-200 text-center">
              <h3 className="text-lg font-semibold">Total Sales Amount</h3>
              <p className="text-2xl">${statistics.totalSalesAmount.toFixed(2)}</p>
            </div>
            <div className="p-4 border rounded-md bg-yellow-200 text-center">
              <h3 className="text-lg font-semibold">Total Items</h3>
              <p className="text-2xl">{statistics.totalItemsCount}</p>
            </div>
            <div className="p-4 border rounded-md bg-yellow-200 text-center">
              <h3 className="text-lg font-semibold">Total Sold Items</h3>
              <p className="text-2xl">{statistics.soldItems}</p>
            </div>
            <div className="p-4 border rounded-md bg-yellow-200 text-center">
              <h3 className="text-lg font-semibold">Total Not Sold Items</h3>
              <p className="text-2xl">{statistics.notSoldItems}</p>
            </div>
          </div>
        </div>

        {/* Bar Chart Data Section */}
        <div className="bar-chart-data">
          <h3 className="text-2xl text-center font-semibold mb-2">Bar Chart Data</h3>
          <div className="p-4 border rounded-md bg-yellow-200 text-center">
            <ul className="grid grid-rows-2 gap-2">
              {barChartData.labels.map((label, index) => (
                // Only render if data[index] is greater than 0
                barChartData.data[index] > 0 && (
                  <li key={index} className="p-3 border rounded-md bg-orange-300 text-center">
                    <div className="font-semibold">{label}</div>
                    <div className="text-2xl">{barChartData.data[index]}</div>
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>

        {/* Pie Chart Data Section */}
        <div className="pie-chart-data">
          <h3 className="text-2xl font-semibold text-center mb-2">Pie Chart Data</h3>
          <div className="p-4 border rounded-md bg-yellow-200 text-center">
            <ul className="grid grid-rows-2 gap-2">
              {pieChartData.map((item, index) => (
                <li key={index} className="p-3 border rounded-md bg-blue-200 text-center">
                  <div className="font-semibold">{item.category}</div>
                  <div className="text-2xl">{item.count}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Combine;
