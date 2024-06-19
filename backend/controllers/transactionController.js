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

  if (!month) {
    return res.status(400).json({ message: 'Month parameter is required' });
  }

  const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1; // Convert month to index (1-12)

  try {
    let query = {
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthIndex] // Match month regardless of year
      }
    };

    if (search) {
      const numericSearch = parseFloat(search); // Convert search term to float

      if (!isNaN(numericSearch)) {
        // If search term is a valid number, search by exact price or approximate price range
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          {
            $expr: {
              $and: [
                { $gte: [{ $toDouble: "$price" }, numericSearch - 100] },
                { $lte: [{ $toDouble: "$price" }, numericSearch + 100] }
              ]
            }
          }
        ];
      } else {
        // If search term is not a valid number, only search by title and description fields
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
    }

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({ transactions, total });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get statistics for a given month
const getStatistics = async (req) => {
    const { month } = req.query;
    if (!month) {
      return { status: 400, data: { message: 'Month parameter is required' } };
    }
  
    const date = new Date(`${month} 1, 2000`);
    if (isNaN(date.getTime())) {
      return { status: 400, data: { message: 'Invalid month parameter' } };
    }
  
    const monthIndex = date.getMonth() + 1; // Use date.getMonth() to get month index
  
    try {
      const totalSalesAmount = await Transaction.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: '$dateOfSale' }, monthIndex]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$price' }
          }
        }
      ]);
  
      const totalItemsCount = await Transaction.countDocuments({
        $expr: {
          $eq: [{ $month: '$dateOfSale' }, monthIndex]
        }
      });
  
      const soldItemsCount = await Transaction.countDocuments({
        $expr: {
            $eq: [{ $month: '$dateOfSale' }, monthIndex]
          },
          sold: true
      });
  
      const notSoldItemsCount = totalItemsCount - soldItemsCount;
  
      const statistics = {
        totalSalesAmount: totalSalesAmount.length > 0 ? totalSalesAmount[0].totalAmount : 0,
        soldItems: soldItemsCount,
        notSoldItems: notSoldItemsCount,
        totalItemsCount: totalItemsCount
      };
  
      return { status: 200, data: statistics };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { status: 500, data: { message: 'Error fetching statistics', error: error.message } };
    }
  };
  
// Get bar chart data for a given month
const getBarChartData = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return { status: 400, data: { message: 'Month parameter is required' } };
  }

  const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1; // Convert month to index (1-12)

  try {
    const priceRanges = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthIndex]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: "901-above",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Format the response to match the required price ranges
    const formattedResponse = priceRanges.reduce((acc, range) => {
      const label = range._id === "901-above" ? "901-above" : `${range._id}-${range._id + 99}`;
      acc[label] = range.count;
      return acc;
    }, {});
     
    return { status: 200, data: formattedResponse };
    
  } catch (error) {
    console.error('Error fetching bar chart data:', error); // Log error for debugging

    return { status: 500, data: { message: 'Error fetching bar chart data', error: error.message } };
    
  }
};

// Get pie chart data for a given month
const getPieChartData = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return { status: 400, data: { message: 'Month parameter is required' } };
  }

  const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1; // Convert month to index (1-12)

  try {
    const transactions = await Transaction.find({
      $expr: {
        $eq: [{ $month: '$dateOfSale' }, monthIndex]
      }
    });

    const categoryCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category]
    }));

    return { status: 200, data: pieChartData };
  } catch (error) {
    return { status: 500, data: { message: 'Error fetching pie chart data', error: error.message } };
  }
};

// Get combined data from all the other APIs for a given month
const getCombinedData = async (req, res) => {
  const { month } = req.query;

  try {
    const [statisticsRes, barChartDataRes, pieChartDataRes] = await Promise.all([
      getStatistics({ query: { month } }),
      getBarChartData({ query: { month } }),
      getPieChartData({ query: { month } })
    ]);

    if (statisticsRes.status !== 200 || barChartDataRes.status !== 200 || pieChartDataRes.status !== 200) {
      throw new Error('Error fetching data'); // Handle non-200 responses if needed
    }

    const responseData = {
      statistics: statisticsRes.data,
      barChartData: barChartDataRes.data,
      pieChartData: pieChartDataRes.data
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ message: 'Error fetching combined data', error: error.message });
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
