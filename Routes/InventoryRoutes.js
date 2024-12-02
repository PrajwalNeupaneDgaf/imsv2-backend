const express = require('express');
const { Authorize } = require('../Middleware/UserMiddleware');
const { getAllInventoryItems } = require('../Controller/InventoryController');
const InventoryPageController = require('../Controller/InventoryPageController')
const router = express.Router();


router.use(Authorize)

router.get('/',getAllInventoryItems)


// Route to get inventory data (total items, nearly finished, out of stock)
router.get('/inventory-data', InventoryPageController.getInventoryData);

// Route to get a specific item by ID, including purchase and sale history
router.get('/item/:itemId', InventoryPageController.getItemById);

module.exports = router;


module.exports =  router
