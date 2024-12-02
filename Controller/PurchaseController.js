const Item = require('../Models/Purchase');
const Inventory = require ('../Models/Inventory')

const createItem = async (req, res) => {
    const { name, category, supplier_id, price, quantity, subUnit, description, isPaid, paidPrice, discount,itemId,isExisting } = req.body;
    if(isExisting){
        if(!itemId){
            return res.status(400).json({message: "Item ID is required for existing item"})
        }
        if (!supplier_id || !description) {
            return res.status(400).json({ message: "Name, Category, Supplier ID, and Description are required fields." });
        }
        if (price <= 0) {
            return res.status(400).json({ message: "Price must be greater than zero." });
        }
        if (quantity < 0) {
            return res.status(400).json({ message: "Quantity cannot be negative." });
        }
        if (subUnit <= 0) {
            return res.status(400).json({ message: "Subunit cannot be negative." });
        }
        if (isPaid && paidPrice <0) {
            return res.status(400).json({ message: "Paid Price cannot be negative." });
        }
        if (discount && discount < 0) {
            return res.status(400).json({ message: "Discount cannot be negative." });
        }
        const data = await Inventory.findById(itemId)
        if(!data){
            return res.status(400).json({message: "Item not found."})
            }
            const newItem = new Item({
                name:data.name,
                category:data.category,
                supplier_id,
                price,
                quantity,
                subUnit:data.subUnit,
                description,
                isPaid,
                paidPrice:isPaid?paidPrice:'0',
                discount,
                });
                await newItem.save();
                if(data.subUnit!=subUnit){
                    const newInventory = new Inventory({
                        name:data.name,
                        category:data.category,
                        purchase_id:newItem._id,
                        supplier_id,
                        price,
                        quantity,
                        subUnit,
                        description,
                    })
                    await newInventory.save();
                    return res.json({
                        message: "Item updated successfully.",
                    })
                }
                const quantityToAdd = parseInt(quantity) + parseInt(data.quantity)
                await Inventory.findByIdAndUpdate(itemId,{
                    name:data.name,
                    category:data.category,
                    purchase_id:newItem._id,
                    supplier_id,
                    price,
                    quantity:quantityToAdd,
                    subUnit:data.subUnit,
                    description:description?description:data.description
                })
              return  res.status(201).json({ message: "Item created successfully", item: newItem });
    }
    // Manual validation checks
    if (!name || !category || !supplier_id || !description) {
        return res.status(400).json({ message: "Name, Category, Supplier ID, and Description are required fields." });
    }
    if (price <= 0) {
        return res.status(400).json({ message: "Price must be greater than zero." });
    }
    if (quantity < 0) {
        return res.status(400).json({ message: "Quantity cannot be negative." });
    }
    if (subUnit <= 0) {
        return res.status(400).json({ message: "SubUnit must be greater than zero." });
    }
    if (isPaid && paidPrice <=0) {
        return res.status(400).json({ message: "Paid Price cannot be negative." });
    }
    if (discount && discount < 0) {
        return res.status(400).json({ message: "Discount cannot be negative." });
    }

    try {
        const newItem = new Item({
            name,
            category,
            supplier_id,
            price,
            quantity,
            subUnit,
            description,
            isPaid,
            paidPrice,
            discount
        });

        const newInventory = new Inventory({
            name,
            category,
            purchase_id:newItem._id,
            supplier_id,
            price,
            quantity,
            subUnit,
            description,
        })

        await newItem.save();
        await newInventory.save();
        res.status(201).json({ message: "Item created successfully", item: newItem });
    } catch (error) {
        res.status(500).json({ message: "Error creating item", error: error.message });
    }
};
const getItems = async (req, res) => {
    try {
        const items = await Item.find().populate('supplier_id');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Error fetching items", error: error.message });
    }
};
const getItemById = async (req, res) => {
    const { id } = req.params;


    try {
        const item = await Item.findById(id).populate('supplier_id');
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Error fetching item", error: error.message });
    }
};
const updateItem = async (req, res) => {
    const { id } = req.params;
    const { name, category, supplier_id, price, quantity, subUnit, description, isPaid, paidPrice, discount } = req.body;

    // Manual validation checks
    if (!name || !category || !supplier_id || !description) {
        return res.status(400).json({ message: "Name, Category, Supplier ID, and Description are required fields." });
    }
    if (price <= 0) {
        return res.status(400).json({ message: "Price must be greater than zero." });
    }
    if (quantity < 0) {
        return res.status(400).json({ message: "Quantity cannot be negative." });
    }
    if (subUnit <= 0) {
        return res.status(400).json({ message: "SubUnit must be greater than zero." });
    }
    if (paidPrice < 0) {
        return res.status(400).json({ message: "Paid Price cannot be negative." });
    }
    if (discount && discount < 0) {
        return res.status(400).json({ message: "Discount cannot be negative." });
    }

    try {
        const updatedItem = await Item.findByIdAndUpdate(id, {
            name,
            category,
            supplier_id,
            price,
            quantity,
            subUnit,
            description,
            isPaid,
            paidPrice,
            discount
        }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        let updateInventory = await Inventory.find({purchase_id:id})
        if (!updateInventory.length) {
            console.log("No inventory items found for this purchase ID.");
            return;
          }
        updateInventory= {
            "name": updatedItem.name,
            "category": updatedItem.category,
            "price": updatedItem.price,
            "quantity": updatedItem.quantity,
            "subUnit": updatedItem.subUnit,
            "description": updatedItem.description,
            "purchase_id": updatedItem._id,
        }
       const updatedInventory= await Inventory.updateOne({purchase_id:id},updateInventory);
       if(updatedInventory){
        return res.status(200).json({ message: "Item updated successfully" });
       }


        res.status(200).json({ message: "Item updated successfully", item: updatedItem });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating item", error: error.message });
    }
};
const deleteItem = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the item by ID
        const deletedItem = await Item.findById(id);
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Find the related inventory by purchase_id
        const updateInventory = await Inventory.findOne({ id: deletedItem.itemId });
        if (!updateInventory) {
            return res.status(404).json({ message: "Inventory not found for this item" });
        }

        // Handle different scenarios
        if (updateInventory.quantity === deletedItem.quantity) {
            await Item.findByIdAndDelete(id);
            await Inventory.deleteOne({ id: deleteItem.itemId });
        } else if (updateInventory.quantity < deletedItem.quantity) {
            return res.status(400).json({ message: "Inventory quantity is less than item quantity" });
        } else if (updateInventory.quantity <= 0) {
            await Item.findByIdAndDelete(id);
        } else {
            // Update inventory quantity and delete the item
            const updatedInventory = {
                quantity: parseInt(updateInventory.quantity) - parseInt(deletedItem.quantity),
            };
            await Inventory.updateOne({ id: deleteItem.itemId }, updatedInventory);
            await Item.findByIdAndDelete(id);
        }

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Error deleting item", error: error.message });
    }
};



module.exports = {
    createItem,
    getItems,
    updateItem,
    deleteItem,
    getItemById

}