const express = require('express');
const router = express.Router();
const saleController = require('../Controller/SaleController');
const { Authorize } = require('../Middleware/UserMiddleware');

// Sale Routes
router.use(Authorize)
router.post('/', saleController.createSale);
router.get('/', saleController.getAllSales);
router.get('/:id', saleController.getSaleById);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router;
