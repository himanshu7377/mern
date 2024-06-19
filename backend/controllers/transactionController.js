const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize the database by fetching data from the third-party API and seeding the database
const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);

    res.status(200).json({ message: 'Database initialized with seed data.' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing database', error });
  }
};

// Get transactions with search and pagination
const getTransactions = async (req, res) => {
  const { month, page = 1, perPage = 10, search = '' } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // Convert month to index (0-11)

  try {
    const query = {
      dateOfSale: { $month: monthIndex + 1 }, // Match month regardless of year
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } }
      ]
    };

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({ transactions, total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

// Get statistics for a given month
const getStatistics = async (req, res) => {
  const { month } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // Convert month to index (0-11)

  try {
    const transactions = await Transaction.find({ dateOfSale: { $month: monthIndex + 1 } });

    const totalSalesAmount = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
    const soldItems = transactions.filter(transaction => transaction.isSold).length;
    const notSoldItems = transactions.length - soldItems;

    res.status(200).json({ totalSalesAmount, soldItems, notSoldItems });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
};

// Get bar chart data for a given month
const getBarChartData = async (req, res) => {
  const { month } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // Convert month to index (0-11)

  try {
    const transactions = await Transaction.find({ dateOfSale: { $month: monthIndex + 1 } });

    const priceRanges = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401-500', count: 0 },
      { range: '501-600', count: 0 },
      { range: '601-700', count: 0 },
      { range: '701-800', count: 0 },
      { range: '801-900', count: 0 },
      { range: '901-above', count: 0 }
    ];

    transactions.forEach(transaction => {
      if (transaction.price <= 100) priceRanges[0].count++;
      else if (transaction.price <= 200) priceRanges[1].count++;
      else if (transaction.price <= 300) priceRanges[2].count++;
      else if (transaction.price <= 400) priceRanges[3].count++;
      else if (transaction.price <= 500) priceRanges[4].count++;
      else if (transaction.price <= 600) priceRanges[5].count++;
      else if (transaction.price <= 700) priceRanges[6].count++;
      else if (transaction.price <= 800) priceRanges[7].count++;
      else if (transaction.price <= 900) priceRanges[8].count++;
      else priceRanges[9].count++;
    });

    res.status(200).json(priceRanges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bar chart data', error });
  }
};

// Get pie chart data for a given month
const getPieChartData = async (req, res) => {
  const { month } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // Convert month to index (0-11)

  try {
    const transactions = await Transaction.find({ dateOfSale: { $month: monthIndex + 1 } });

    const categoryCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category]
    }));

    res.status(200).json(pieChartData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pie chart data', error });
  }
};

// Get combined data from all the other APIs for a given month
const getCombinedData = async (req, res) => {
  const { month } = req.query;

  try {
    const transactions = await getTransactions({ query: { month } }, res, true);
    const statistics = await getStatistics({ query: { month } }, res, true);
    const barChartData = await getBarChartData({ query: { month } }, res, true);
    const pieChartData = await getPieChartData({ query: { month } }, res, true);

    res.status(200).json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChartData: barChartData.data,
      pieChartData: pieChartData.data
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching combined data', error });
  }
};

module.exports = {
  initializeDatabase,
  getTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
  getCombinedData
};
