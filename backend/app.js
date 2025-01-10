require('dotenv').config();
const express = require('express');
const { connectQueue } = require('./config/queue');
const authRoutes = require('./routes/authRoutes');
const queueRoutes = require('./routes/queueRoutes');
const pool = require('./config/db');

const app = express();
app.use(express.json());  // Use the built-in express.json() middleware

app.use('/auth', authRoutes);
app.use('/queue', queueRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('Backend is healthy');
});

const startApp = async () => {
    try {
        await connectQueue();  // Ensure RabbitMQ connection before starting the app
        await pool.connect();   // Ensure PostgreSQL connection is successful
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start app:", error);
        process.exit(1);  // Exit the process if connection fails
    }
};

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log("Received SIGINT. Closing connections...");
    if (connection) connection.close();  // Close RabbitMQ connection
    process.exit(0);  // Exit the process cleanly
});

process.on('SIGTERM', () => {
    console.log("Received SIGTERM. Closing connections...");
    if (connection) connection.close();  // Close RabbitMQ connection
    process.exit(0);  // Exit the process cleanly
});

startApp();
