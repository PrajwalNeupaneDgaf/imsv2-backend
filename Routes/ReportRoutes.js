const express = require('express');
const router = express.Router();
const reportController = require('../Controller/ReportController');
const { Authorize } = require('../Middleware/UserMiddleware');

router.use(Authorize)

// Route for Sales Report
router.get('/sales', reportController.getSalesReport);

// Route for Purchase Report
router.get('/purchases', reportController.getPurchaseReport);

// Route for Profit & Loss Report
router.get('/profit-loss', reportController.getProfitLossReport);

module.exports = router;
