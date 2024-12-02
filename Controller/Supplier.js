const Purchase = require('../Models/Purchase');
const Supplier = require('../Models/Supplier'); // Capitalized to follow common naming conventions for models.

const validateFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (value == null || value === '') {
            return { valid: false, field: key };
        }
    }
    return { valid: true };
};

// Create a new supplier
const insert = async (req, res) => {
    const { name, contact, email, businessName, businessEmail, website, address } = req.body;

    // Validate required fields
    const validation = validateFields({ name, contact, email, businessName, businessEmail, address });
    if (!validation.valid) {
        return res.status(400).json({ message: `Please fill the '${validation.field}' field` });
    }

    const newSupplier = new Supplier({
        name,
        contact,
        email,
        businessName,
        businessEmail,
        website: website || null, // Allow optional fields to be null
        address,
    });

    try {
        await newSupplier.save();
        return res.status(201).json({ message: "Supplier inserted successfully", supplier: newSupplier });
    } catch (error) {
        console.error("Error inserting supplier:", error);
        return res.status(500).json({
            message: "Failed to insert supplier",
            error: error.message,
        });
    }
};

// Retrieve all suppliers
const getAll = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        return res.status(200).json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return res.status(500).json({
            message: "Failed to fetch suppliers",
            error: error.message,
        });
    }
};

// Retrieve a single supplier by ID
const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const supplier = await Supplier.findById(id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        return res.status(200).json(supplier);
    } catch (error) {
        console.error("Error fetching supplier:", error);
        return res.status(500).json({
            message: "Failed to fetch supplier",
            error: error.message,
        });
    }
};

// Update a supplier by ID with null checks
const update = async (req, res) => {
    const { id } = req.params;
    const { name, contact, email, businessName, businessEmail, website, address } = req.body;

    // Validate required fields for update (optional fields can be omitted)
    const validation = validateFields({ name, contact, email, businessName, businessEmail, address });
    if (!validation.valid) {
        return res.status(400).json({ message: `Invalid value for '${validation.field}'` });
    }

    try {
        const supplier = await Supplier.findByIdAndUpdate(id, {
            name,
            contact,
            email,
            businessName,
            businessEmail,
            website,
            address,
        }, { new: true });
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        return res.status(200).json({ message: "Supplier updated successfully", supplier });
    } catch (error) {
        console.error("Error updating supplier:", error);
        return res.status(500).json({
            message: "Failed to update supplier",
            error: error.message,
        });
    }
};

// Delete a supplier by ID
const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const supplier = await Supplier.findByIdAndDelete(id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        return res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (error) {
        console.error("Error deleting supplier:", error);
        return res.status(500).json({
            message: "Failed to delete supplier",
            error: error.message,
        });
    }
};

const purchaseHistory = async (req,res)=>{
    const {id}=req.params;
 try {
    const data = await Purchase.find({supplier_id:id})
    return res.status(200).json({
        data:data
    })
 } catch (error) {
    return res.status(500).json({
        message: "Failed to get purchase history",
    })
 }

}

// Export all CRUD functions
module.exports = { insert, getAll, getById, update, remove ,purchaseHistory};
