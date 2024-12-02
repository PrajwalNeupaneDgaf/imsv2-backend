const express = require('express');
const { getItems, createItem, getItemById, updateItem, deleteItem } = require('../Controller/PurchaseController');
const { Authorize } = require('../Middleware/UserMiddleware');
const router = express.Router();


router.use(Authorize)

router.get('/',getItems)

router.post('/',createItem)

router.get('/:id',getItemById)

router.put('/:id',updateItem)

router.delete('/:id',deleteItem)

module.exports = router