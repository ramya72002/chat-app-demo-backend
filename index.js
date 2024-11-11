const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index');

app.use(cors({
    origin: "https://chat-app-demo-frontend-nine.vercel.app",  // Replace with frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookiesParser());

// API Endpoints
app.use('/api', router);

connectDB().then(() => {
    server.listen(process.env.PORT || 3000, () => {
        console.log("Server is running");
    });
});
