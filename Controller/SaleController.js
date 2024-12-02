const mongoose = require("mongoose");
const Sale = require("../Models/Sale");
const Inventory = require("../Models/Inventory");

// Helper function to validate sale data
const validateSaleData = async (data) => {
    const { itemId, itemsSold, paidPrice, totalPrice } = data;

    if (!itemId) return "Item ID is required.";
    if (itemsSold <= 0) return "Items sold must be greater than zero.";

    const inventory = await Inventory.findById(itemId);
    if (!inventory) return "Inventory item not found.";
    if (inventory.quantity < itemsSold) return `Insufficient stock. Available: ${inventory.quantity}.`;

    if (paidPrice < 0 || paidPrice > totalPrice) {
        return "Invalid paid price. It must be between 0 and total price.";
    }

    return null; // Valid
};

// Create Sale
const createSale = async (req, res) => {
    try {
        const validationError = await validateSaleData(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const { itemId, paidPrice, itemsSold, paymentType, discount, price, buyerEmail, soldTo } = req.body;
        const inventory = await Inventory.findById(itemId);

        const sale = new Sale({ Item:itemId, SoldTo:soldTo, paidPrice, itemsSold, paymentType, discount, price, buyerEmail });
        await sale.save();

        inventory.quantity -= itemsSold;
        await inventory.save();

        res.status(201).json({
            success: true,
            message: "Sale created successfully",
            data: sale,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating sale", error: error.message });
    }
};

// Get All Sales
const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate("Item");
        res.status(200).json({
            success: true,
            message: "Sales fetched successfully",
            data: sales,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching sales", error: error.message });
    }
};

// Get Sale by ID
const getSaleById = async (req, res) => {
    const { id } = req.params;

    try {
        const sale = await Sale.findById(id).populate("Item");
        if (!sale) {
            return res.status(404).json({ success: false, message: "Sale not found" });
        }
        res.status(200).json({
            success: true,
            message: "Sale fetched successfully",
            data: sale,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching sale", error: error.message });
    }
};

// Update Sale
const updateSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemId, itemsSold, paidPrice, totalPrice } = req.body;

        const sale = await Sale.findById(id);
        if (!sale) {
            return res.status(404).json({ success: false, message: "Sale not found" });
        }

        const inventory = await Inventory.findById(itemId);
        if (!inventory) {
            return res.status(404).json({ success: false, message: "Inventory item not found" });
        }

        // Restore previous quantity
        inventory.quantity += sale.itemsSold;

        const validationError = await validateSaleData(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        // Deduct new quantity
        inventory.quantity -= itemsSold;
        await inventory.save();

        // Update sale record
        const updatedSale = await Sale.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({
            success: true,
            message: "Sale updated successfully",
            data: updatedSale,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating sale", error: error.message });
    }
};

// Delete Sale
const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(id)

        const sale = await Sale.findById(id);
        if (!sale) {
            return res.status(404).json({ success: false, message: "Sale not found" });
        }

        const inventory = await Inventory.findById(sale.Item);
        if (inventory) {
            inventory.quantity += sale.itemsSold; // Restore sold quantity
            await inventory.save();
        }

        await sale.deleteOne();
        res.status(200).json({
            success: true,
            message: "Sale deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting sale", error: error.message });
    }
};

// Export Controller Functions
module.exports = {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    deleteSale,
};
