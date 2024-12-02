const express = require('express');
const router = express.Router();
const { insert, getAll, getById, update, remove, purchaseHistory } = require('../Controller/Supplier'); // Import CRUD functions from the controller
const { Authorize } = require('../Middleware/UserMiddleware');

router.use(Authorize)
// Route to create a new supplier
router.post('/', insert);

// Route to get all suppliers
router.get('/', getAll);

// Route to get a specific supplier by ID
router.get('/:id', getById);

// Route to update a supplier by ID
router.put('/:id', update);

// Route to delete a supplier by ID
router.delete('/:id', remove);

router.get('./purchase/:id' , purchaseHistory)

module.exports = router; // Export the router
