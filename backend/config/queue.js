const amqp = require('amqplib');

let channel;
let connection;

const connectQueue = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
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
