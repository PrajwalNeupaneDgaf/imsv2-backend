const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        match: /^[0-9]{7,15}$/ // Validates phone numbers (7-15 digits)
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessEmail: {
        type: String,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation
    },
    website: {
        type: String,
        default: null, // Optional field
        match: /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/ // Validates URLs
    },
    address: {
        type:String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
