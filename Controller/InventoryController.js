const Inventory = require("../Models/Inventory");

const getAllInventoryItems = async (req,res)=>{
    const data = await Inventory.find();
    return res.json(data);
}


module.exports = {
    getAllInventoryItems
}