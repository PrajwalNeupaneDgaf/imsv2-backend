const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    Item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory', // Reference to the Inventory Item model
        required: true
    },
    paidPrice: {
        type: Number,
        required: true,
        min: 0
    },
    itemsSold: {
        type: Number,
        required: true,
        min: 1 // At least one item must be sold
    },
    paymentType: {
        type: String,
        enum: ['COD', 'Online', 'Credit'], // Restricts to specific payment types
        default: 'COD'
    },
    discount: {
        type: Number,
        default: 0, // Discount percentage
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    SoldTo:{
        type: String,
        required: true
    },
    buyerEmail:{
        type:String,
        required:true
    }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
