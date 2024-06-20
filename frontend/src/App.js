import React, { useState, useEffect } from 'react';
import './App.css';
import TransactionsTable from './components/TransactionsTable';
import StatisticsTable from './components/StatisticsTable';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import CombinedChart from './components/Combine';
function App() {
  const [month, setMonth] = useState('march');
  return (
    <div className="App">
     
     <TransactionsTable month={month} setMonth={setMonth} />
      <StatisticsTable month={month} />
      <BarChart month={month} />
      <PieChart month={month} />
      <CombinedChart month={month} />
    </div>
  );
}

export default App;
