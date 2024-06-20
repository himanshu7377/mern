import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ month, setMonth }) => {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchTransactions = async () => {
    try {
      const params = {
        search: searchText,
        page: currentPage.toString(),
        perPage: perPage.toString(),
        month: month
      };

      const response = await axios.get('http://localhost:5000/api/transactions', { params });
      setTransactions(response.data.transactions);
      setTotalTransactions(response.data.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setTotalTransactions(0);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchText, perPage, month]);

  const handleSearch = (event) => {
    setSearchText(event.target.value);
    setCurrentPage(1); // Reset page on search change
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    setCurrentPage(1); // Reset page on month change
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10) || 10);
    setCurrentPage(1); // Reset to first page
  };

  const handleNext = () => {
    if (currentPage * perPage < totalTransactions) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(totalTransactions / perPage);
  const pages = [...Array(totalPages).keys()].map(i => i + 1);

  return (
    <div className="transactions-table p-4  text-center border mt-5 rounded-md shadow-md bg-white max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Transactions Table</h2>

      <div className="search-bar flex mb-4">
        <input
          type="text"
          placeholder="Search transaction"
          value={searchText}
          onChange={handleSearch}
          className="px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
        />

        <select
          value={month}
          onChange={handleMonthChange}
          className="px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="january">January</option>
          <option value="february">February</option>
          <option value="march">March</option>
          <option value="april">April</option>
          <option value="may">May</option>
          <option value="june">June</option>
          <option value="july">July</option>
          <option value="august">August</option>
          <option value="september">September</option>
          <option value="october">October</option>
          <option value="november">November</option>
          <option value="december">December</option>
        </select>
      </div>

      <div className="per-page-selector flex mb-4">
        <label htmlFor="perPage" className="mr-2">Transactions per page:</label>
        <select
          id="perPage"
          value={perPage}
          onChange={handlePerPageChange}
          className="px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <table className="table-auto w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2 border border-gray-300">ID</th>
            <th className="px-3 py-2 border border-gray-300">Title</th>
            <th className="px-3 py-2 border border-gray-300">Description</th>
            <th className="px-3 py-2 border border-gray-300">Price</th>
          </tr>
        </thead>
        <tbody className="text-center align-middle">
  {transactions.map((transaction) => (
    <tr key={transaction.id} className="border-b border-gray-300">
      <td className="px-3 py-2 border border-gray-400">{transaction.id}</td>
      <td className="px-3 py-2 border border-gray-400">{transaction.title}</td>
      <td className="px-3 py-2 border border-gray-400">{transaction.description}</td>
      <td className="px-3 py-2 border border-gray-400">{transaction.price}</td>
    </tr>
  ))}
</tbody>

      </table>

      <div className="pagination flex justify-between items-center mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Previous
        </button>
        <div className="page-numbers flex">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 mx-1 rounded-md border shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                page === currentPage ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={currentPage * perPage >= totalTransactions}
          className="px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionsTable;
