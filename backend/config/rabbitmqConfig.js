const amqp = require('amqplib/callback_api'); // AMQP library for RabbitMQ
require('dotenv').config(); // To load environment variables from .env file

// Get RabbitMQ connection details from environment variables
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'; // Default to localhost if not set

// Function to establish RabbitMQ connection and channel
function connectToRabbitMQ() {
  return new Promise((resolve, reject) => {
    amqp.connect(RABBITMQ_URL, (error, connection) => {
      if (error) {
        return reject(`Failed to connect to RabbitMQ: ${error.message}`);
      }
      console.log('Connected to RabbitMQ successfully.');

      // Create a channel for communication with RabbitMQ
      connection.createChannel((error, channel) => {
        if (error) {
          return reject(`Failed to create a channel: ${error.message}`);
        }

        // Make sure the queues for each client are durable (persist across RabbitMQ restarts)
        channel.assertQueue('defaultQueue', { durable: true });

        resolve({ connection, channel });
      });
    });
  });
}

// Function to send a message to a specific client's queue
function sendToQueue(queueName, message) {
  connectToRabbitMQ()
    .then(({ connection, channel }) => {
      // Send the message to the specified queue
      channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
      console.log(`Sent message to ${queueName}: ${message}`);

      // Close the connection after sending the message
      setTimeout(() => {
        connection.close();
      }, 500);
    })
    .catch((error) => {
      console.error(error);
    });
}

// Function to receive messages from a queue
function consumeFromQueue(queueName, callback) {
  connectToRabbitMQ()
    .then(({ connection, channel }) => {
      channel.consume(
        queueName,
        (msg) => {
          if (msg !== null) {
            console.log(`Received message from ${queueName}: ${msg.content.toString()}`);
            callback(msg.content.toString()); // Process the message with the callback
            channel.ack(msg); // Acknowledge the message
          }
        },
        { noAck: false }
      );
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = {
  connectToRabbitMQ,
  sendToQueue,
  consumeFromQueue,
};
