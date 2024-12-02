const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoutes = require('./Routes/UserRoutes')
const supplierRoutes = require('./Routes/supplierRoutes')
const PurchaseRoute = require('./Routes/PurchaseRoute')
const InventoryRoute = require('./Routes/InventoryRoutes')
const SaleRoute = require('./Routes/SaleRoutes')
const reportRoutes = require('./Routes/ReportRoutes')
const homePageRoute = require('./Routes/HomePageRoute');
const { Authorize } = require('./Middleware/UserMiddleware');
const { getAllUsers } = require('./Controller/UserController');

const app = express();
app.use(cors());
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Placeholder for routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//routes

app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase', PurchaseRoute);
app.use('/api/inventory', InventoryRoute);
app.use('/api/sales', SaleRoute);
app.use('/api/reports', reportRoutes);
app.use('/api', homePageRoute);


app.get('/api/getusers',Authorize,getAllUsers)
