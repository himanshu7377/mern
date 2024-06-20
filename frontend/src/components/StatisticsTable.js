import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsTable = ({ month }) => {

    console.log('month', month)
  const [statistics, setStatistics] = useState({
    totalSalesAmount: 0,
    soldItems: 0,
    notSoldItems: 0,
    totalItemsCount: 0
  });

 

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/statistics', {
        params: { month } // Ensure month is defined and passed correctly
      });
      setStatistics(response.data); // Assuming response.data contains statistics object
      console.log('statistics', statistics)
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    
      fetchStatistics();
    
  }, [month]);

  return (
    <div className="statistics-table p-4 border rounded-md shadow-md bg-yellow-100 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl text-center font-bold mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-md bg-yellow-200 text-center">
          <h3 className="text-lg font-semibold">Total Amount of Sale</h3>
          <p className="text-2xl">${statistics.totalSalesAmount}</p>
        </div>
        <div className="p-4 border rounded-md bg-yellow-200 text-center">
          <h3 className="text-lg font-semibold">Total  Items</h3>
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
  );
};

export default StatisticsTable;
