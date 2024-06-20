const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { getStatistics,getBarChartData,getPieChartData,getCombinedData,getTransactions,initializeDatabase } = require('../controllers/transactionController');
// Initialize database route
router.get('/initialize', transactionController.initializeDatabase);

// Get transactions route
router.get('/', transactionController.getTransactions);



router.get('/statistics', async (req, res) => {
  const result = await getStatistics(req);
  res.status(result.status).json(result.data);
});


router.get('/barchart', async (req, res) => {
  const result = await getBarChartData(req);
  res.status(result.status).json(result.data);
});


router.get('/piechart', async (req, res) => {
  const result = await getPieChartData(req);
  res.status(result.status).json(result.data);
});


router.get('/combine', async (req, res) => {
  const result = await getCombinedData(req);
  res.status(result.status).json(result.data);
});
module.exports = router;
