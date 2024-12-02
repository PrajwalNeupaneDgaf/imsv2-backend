const Sale = require('../Models/Sale');
const Purchase = require('../Models/Purchase');

// Helper function to get start and end of the month
const getMonthRange = (year, month) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    return { startOfMonth, endOfMonth };
};

// Controller to fetch sales report
exports.getSalesReport = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required.' });
        }

        const { startOfMonth, endOfMonth } = getMonthRange(year, month);

        const salesData = await Sale.aggregate([
            {
                $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
            },
            {
                $group: {
                    _id: "$Item",
                    totalRevenue: { $sum: "$paidPrice" }, // Total revenue directly from "paidPrice"
                    totalItemsSold: { $sum: "$itemsSold" }, // Total items sold from "itemsSold"
                }
            },
            {
                $lookup: {
                    from: "inventories", // Assuming the "inventories" collection has product details
                    localField: "_id",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            { $unwind: "$itemDetails" }, // Flatten the array from lookup
            {
                $project: {
                    product: "$itemDetails.name", // Rename item details for clarity
                    totalRevenue: 1,
                    totalItemsSold: 1
                }
            }
        ]);

        res.status(200).json(salesData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving sales report', error: error.message });
    }
};


// Controller to fetch purchase report
exports.getPurchaseReport = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required.' });
        }

        const { startOfMonth, endOfMonth } = getMonthRange(year, month);

        const purchaseData = await Purchase.aggregate([
            {
                $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
            },
            {
                $group: {
                    _id: "$name",
                    totalCost: { $sum: "$price" }, // Directly summing the total cost
                    totalUnitsPurchased: { $sum: "$quantity" } // Summing the total quantity purchased
                }
            }
        ]);

        res.status(200).json(purchaseData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving purchase report', error: error.message });
    }
};


// Controller to fetch profit & loss report
exports.getProfitLossReport = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required.' });
        }

        const { startOfMonth, endOfMonth } = getMonthRange(year, month);

        // Total revenue from sales
        const salesData = await Sale.aggregate([
            { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, totalRevenue: { $sum: "$paidPrice" } } } // Summing "paidPrice" as total revenue
        ]);

        // Total cost from purchases
        const purchaseData = await Purchase.aggregate([
            { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, totalCost: { $sum: "$price" } } } // Summing "price" as total cost
        ]);

        // Calculate total revenue, cost, and net profit
        const totalRevenue = salesData[0]?.totalRevenue || 0;
        const totalCost = purchaseData[0]?.totalCost || 0;
        const netProfit = totalRevenue - totalCost;

        res.status(200).json({ totalRevenue, totalCost, netProfit });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating profit and loss', error: error.message });
    }
};

