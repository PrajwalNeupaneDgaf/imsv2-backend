const Inventory = require('../Models/Inventory');
const Purchase = require('../Models/Purchase'); // Assuming you have a Purchase model
const Sale = require('../Models/Sale'); // Assuming you have a Sale model

// Get all inventory items
exports.getInventoryData = async (req, res) => {
  try {
    // Get total items, nearly finished items, and out of stock items
    const totalItems = await Inventory.countDocuments();
    const nearlyFinishedItems = await Inventory.countDocuments({
      quantity: { $lt: 100 },
    });
    const outOfStockItems = await Inventory.countDocuments({ quantity: 0 });

    res.json({
      totalItems,
      nearlyFinishedItems,
      outOfStockItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching inventory data' });
  }
};

// Get inventory item by ID, along with purchase and sale history
exports.getItemById = async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await Inventory.findById(itemId).populate('purchase_id');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Get the purchase and sale history for the item
    const purchaseHistory = await Purchase.findById(item.purchase_id);
    const saleHistory = await Sale.find({ Item: itemId });

    res.json({
      item,
      purchaseHistory,
      saleHistory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching item details' });
  }
};
