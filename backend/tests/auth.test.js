const { connectQueue, getChannel } = require('../configs/rabbitmqConfig');

/**
 * @function createQueue
 * @description Ensures a queue exists for a specific client.
 * @param {string} queueName - Name of the queue to create.
 * @returns {Promise<void>}
 */
const createQueue = async (queueName) => {
  const channel = getChannel();
  try {
    await channel.assertQueue(queueName, { durable: true });
    console.log(`Queue "${queueName}" created or verified.`);
  } catch (error) {
    console.error(`Failed to create or verify queue "${queueName}": ${error.message}`);
    throw error;
  }
};

/**
 * @function sendToQueue
 * @description Sends a message to a specific queue.
 * @param {string} queueName - The name of the queue.
 * @param {string|Buffer} message - The message to send.
 * @returns {Promise<void>}
 */
const sendToQueue = async (queueName, message) => {
  const channel = getChannel();
  try {
    await channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
    console.log(`Message sent to queue "${queueName}": ${message}`);
  } catch (error) {
    console.error(`Failed to send message to queue "${queueName}": ${error.message}`);
    throw error;
  }
};

/**
 * @function consumeFromQueue
 * @description Consumes messages from a specific queue and processes them.
 * @param {string} queueName - The name of the queue to consume from.
 * @param {Function} messageProcessor - A callback function to process each message.
 * @returns {Promise<void>}
 */
const consumeFromQueue = async (queueName, messageProcessor) => {
  const channel = getChannel();
  try {
    await channel.consume(
      queueName,
      async (msg) => {
        if (msg !== null) {
          console.log(`Message received from queue "${queueName}": ${msg.content.toString()}`);
          try {
            await messageProcessor(msg.content.toString());
            channel.ack(msg); // Acknowledge the message after successful processing
          } catch (processingError) {
            console.error(`Error processing message: ${processingError.message}`);
            channel.nack(msg, false, false); // Negative acknowledgment, discard the message
          }
        }
      },
      { noAck: false }
    );
    console.log(`Started consuming messages from queue "${queueName}".`);
  } catch (error) {
    console.error(`Failed to consume messages from queue "${queueName}": ${error.message}`);
    throw error;
  }
};

module.exports = {
  createQueue,
  sendToQueue,
  consumeFromQueue,
};
