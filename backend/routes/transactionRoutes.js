const express = require('express');
const router = express.Router();
const { 
  initializeDatabase, 
  getTransactions, 
  getStatistics, 
  getBarChartData, 
  getPieChartData, 
  getCombinedData 
} = require('../controllers/transactionController');

router.get('/initialize', initializeDatabase);
router.get('/', getTransactions);
router.get('/statistics', getStatistics);
router.get('/barchart', getBarChartData);
router.get('/piechart', getPieChartData);
router.get('/combined', getCombinedData);

module.exports = router;
