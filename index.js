const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app } = require('./socket/index') // Only use the app from socket/index

// Set up middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookiesParser())

app.get('/', (request, response) => {
    response.json({
        message: "Server running"
    })
})

// API endpoints
app.use('/api', router)

// Connect to DB
connectDB()

// Export the app for Vercel
module.exports = app
