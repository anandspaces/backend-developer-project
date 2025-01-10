const amqp = require('amqplib');

let channel;

const connectQueue = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
};

const getChannel = () => {
    if (!channel) throw new Error("Queue connection not established");
    return channel;
};

module.exports = { connectQueue, getChannel };
