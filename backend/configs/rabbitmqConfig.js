const amqp = require('amqplib');
require('dotenv').config(); // To load environment variables from .env file

let channel;
let connection;
let isConnected = false;

// Function to establish RabbitMQ connection and channel
const connectQueue = async () => {
    if (isConnected) return;  // Skip connection attempts if already connected

    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        
        // Ensure the queues for each client are durable (persist across RabbitMQ restarts)
        await channel.assertQueue('defaultQueue', { durable: true });

        isConnected = true;
        console.log('RabbitMQ connected successfully.');
    } catch (error) {
        console.error("Failed to connect to RabbitMQ, retrying...", error);
        setTimeout(connectQueue, 5000);  // Retry in 5 seconds
    }
};

// Function to get the RabbitMQ channel
const getChannel = () => {
    if (!channel) {
        throw new Error("Queue connection not established. Call connectQueue() first.");
    }
    return channel;
};

// Function to send a message to a specific client's queue
const sendToQueue = async (queueName, message) => {
    try {
        await connectQueue();  // Ensure connection is established before sending a message

        const ch = getChannel();
        ch.sendToQueue(queueName, Buffer.from(message), { persistent: true });
        console.log(`Sent message to ${queueName}: ${message}`);
    } catch (error) {
        console.error("Failed to send message:", error);
    }
};

// Function to consume messages from a queue
const consumeFromQueue = async (queueName, callback) => {
    try {
        await connectQueue();  // Ensure connection is established before consuming

        const ch = getChannel();
        ch.consume(
            queueName,
            (msg) => {
                if (msg !== null) {
                    console.log(`Received message from ${queueName}: ${msg.content.toString()}`);
                    callback(msg.content.toString()); // Process the message with the callback
                    ch.ack(msg); // Acknowledge the message
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Failed to consume message:", error);
    }
};

// Gracefully close the RabbitMQ connection
const closeConnection = async () => {
    try {
        if (connection) {
            await channel.close();
            await connection.close();
            isConnected = false;
            console.log("RabbitMQ connection closed.");
        }
    } catch (error) {
        console.error("Error closing RabbitMQ connection:", error);
    }
};

module.exports = {
    connectQueue,
    getChannel,
    sendToQueue,
    consumeFromQueue,
    closeConnection,
};
