const { getChannel } = require('../config/queue');
const { logRequest } = require('../models/logModel');

const enqueueRequest = async (req, res) => {
    const { request } = req.body;
    const { username } = req.user;

    const channel = getChannel();
    const queueName = `queue_${username}`;

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(request));

    await logRequest(username, request);

    res.status(200).json({ message: "Request enqueued" });
};

module.exports = { enqueueRequest };
