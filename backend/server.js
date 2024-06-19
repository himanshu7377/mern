const express = require('express');
const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
const app = express();

// Load environment variables
require('dotenv').config();

// Connect to the database
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
