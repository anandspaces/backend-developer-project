const { getChannel } = require('../config/rabbitmqConfig');

/**
 * Ensure a queue exists for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<void>}
 */
const ensureQueue = async (userId) => {
  const channel = getChannel();
  const queueName = `queue_${userId}`;
  try {
    await channel.assertQueue(queueName, { durable: true });
    console.log(`Queue ensured for user: ${userId}`);
  } catch (error) {
    console.error(`Failed to ensure queue for user ${userId}:`, error);
    throw new Error('Queue creation failed.');
  }
};

/**
 * Add a message to the user's queue.
 * @param {string} userId - The ID of the user.
 * @param {string} message - The message to enqueue.
 * @returns {Promise<void>}
 */
const enqueueRequest = async (userId, message) => {
  const channel = getChannel();
  const queueName = `queue_${userId}`;
  try {
    await ensureQueue(userId);
    channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
    console.log(`Message enqueued for user ${userId}: ${message}`);
  } catch (error) {
    console.error(`Failed to enqueue request for user ${userId}:`, error);
    throw new Error('Failed to enqueue request.');
  }
};

/**
 * Process messages from the user's queue.
 * @param {string} userId - The ID of the user.
 * @param {function} processMessage - Callback to process each message.
 * @returns {Promise<void>}
 */
const processQueue = async (userId, processMessage) => {
  const channel = getChannel();
  const queueName = `queue_${userId}`;
  try {
    await ensureQueue(userId);

    channel.consume(
      queueName,
      async (msg) => {
        if (msg !== null) {
          try {
            console.log(`Processing message from user ${userId}: ${msg.content.toString()}`);
            await processMessage(msg.content.toString());
            channel.ack(msg); // Acknowledge the message after processing
          } catch (error) {
            console.error(`Error processing message for user ${userId}:`, error);
            channel.nack(msg); // Negative acknowledgment (optional: requeue the message)
          }
        }
      },
      { noAck: false }
    );

    console.log(`Started processing queue for user ${userId}`);
  } catch (error) {
    console.error(`Failed to process queue for user ${userId}:`, error);
    throw new Error('Queue processing failed.');
  }
};

/**
 * Delete the user's queue.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<void>}
 */
const deleteQueue = async (userId) => {
  const channel = getChannel();
  const queueName = `queue_${userId}`;
  try {
    await channel.deleteQueue(queueName);
    console.log(`Queue deleted for user: ${userId}`);
  } catch (error) {
    console.error(`Failed to delete queue for user ${userId}:`, error);
    throw new Error('Queue deletion failed.');
  }
};

module.exports = {
  ensureQueue,
  enqueueRequest,
  processQueue,
  deleteQueue,
};
