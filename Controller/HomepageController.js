const Sale = require('../Models/Sale');
const Inventory = require('../Models/Inventory');
const User = require('../Models/User');
const Purchase = require('../Models/Purchase');

// Controller to get homepage data
exports.getHomePageData = async (req, res) => {
    try {
        // Fetch total number of items
        const totalItems = await Inventory.countDocuments();

        // Fetch total sales (This can be for a specific period, e.g., the current week)
        const totalSales = await Sale.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$paidPrice" },
                    totalItemsSold: { $sum: "$itemsSold" }
                }
            }
        ]);

        // Fetch total number of users
        const totalUsers = await User.countDocuments();

        // Fetch low stock items (Items with stock less than or equal to 50)
        const lowStockItems = await Inventory.find({ quantity: { $lte: 50 } });

        // Fetch sales data for the chart (Top 10 most sold products)
        const salesChartData = await Sale.aggregate([
            {
                $group: {
                    _id: "$Item",
                    totalSold: { $sum: "$itemsSold" },
                    revenue: { $sum: "$paidPrice" },
                }
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            { $unwind: "$itemDetails" },
            {
                $project: {
                    name: "$itemDetails.name",
                    totalSold: 1,
                    revenue: 1
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

        // Prepare response data
        const responseData = {
            totalItems,
            totalSales: totalSales[0] || { totalRevenue: 0, totalItemsSold: 0 },
            totalUsers,
            lowStockItems,
            salesChartData
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching homepage data', error: error.message });
    }
};
