const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    purchase_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase',
        required: true
    },
    category: {
        type: String, 
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
        type: Number, 
        required: true
    },
    description: {
        type: String,
        required:true
    },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', itemSchema);
