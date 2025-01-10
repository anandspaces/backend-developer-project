const amqp = require('amqplib');

let channel;
let connection;
let isConnected = false;

const connectQueue = async () => {
    if (isConnected) return;  // Skip connection attempts if already connected

    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        isConnected = true;
        console.log("RabbitMQ connected successfully.");
    } catch (error) {
        console.error("Failed to connect to RabbitMQ, retrying...", error);
        setTimeout(connectQueue, 5000);  // Retry in 5 seconds
    }
};

const getChannel = () => {
    if (!channel) throw new Error("Queue connection not established");
    return channel;
};

module.exports = { connectQueue, getChannel };
