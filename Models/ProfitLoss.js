const mongoose = require('mongoose');

const profitLossSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', // Reference to the Item model
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0
    },
    soldPrice: {
        type: Number,
        required: true,
        min: 0
    },
    isProfit: {
        type: Boolean,
        required: true
    },
    plAmount: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ProfitLoss', profitLossSchema);
