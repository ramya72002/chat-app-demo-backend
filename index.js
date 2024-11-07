const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index'); 
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index');

// const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookiesParser());

app.get('/', (request, response) => {
    response.json({
        message: "Server is running"
    });
});

// API endpoints
app.use('/api', router);

// Connect to the database and log success
connectDB().then(() => {
    console.log("Database connected successfully");
});

module.exports = app;  // Export the app for Vercel
