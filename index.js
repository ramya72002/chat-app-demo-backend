const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app, server } = require('./socket/index')

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookiesParser())

// API Endpoints
app.get('/', (request, response) => {
    response.json({
        message: "Server running"
    })
})
app.use('/api', router)

// Connect to DB and Start Server
connectDB().then(() => {
    server.listen(process.env.PORT || 3000, () => {  // Vercel assigns a port
        console.log("Server is running")
    })
})
