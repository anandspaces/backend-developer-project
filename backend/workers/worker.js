const { getChannel } = require('../config/queue');

const processQueue = async (queueName) => {
    const channel = getChannel();

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(queueName, (msg) => {
        console.log(`Processing request: ${msg.content.toString()}`);
        channel.ack(msg);
    });
};

module.exports = { processQueue };
