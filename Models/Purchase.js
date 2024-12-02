const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String, 
        required: true
    },
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    subUnit: {
        type: Number, // units in Box
        required: true
    },
    description: {
        type: String,
        required:true
    },
    isPaid: {
        type: Boolean,
        default: false 
    },
    paidPrice: {
        type: Number,
        default: 0,  // The amount paid, only relevant if isPaid is false
        min: 0
    },
    discount: {
        type: Number,
        default: null ,
        max: 100,
    }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', itemSchema);
