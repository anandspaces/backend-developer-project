const { consumeFromQueue } = require('../config/rabbitmqConfig');
const pool = require('../config/postgresConfig'); // Database connection for logging
require('dotenv').config();

/**
 * Worker function to process tasks from a specific queue.
 * @param {string} queueName - The name of the queue to process tasks from.
 * @param {function} taskHandler - Function to handle individual tasks.
 */
const startWorker = (queueName, taskHandler) => {
  console.log(`Worker started for queue: ${queueName}`);

  consumeFromQueue(queueName, async (message) => {
    try {
      console.log(`Worker processing task from ${queueName}:`, message);

      // Process the task using the provided task handler
      await taskHandler(message);

      // Log the successful processing of the task
      await pool.query(
        'INSERT INTO task_logs (queue_name, task, processed_at, status) VALUES ($1, $2, NOW(), $3)',
        [queueName, message, 'success']
      );

      console.log(`Task successfully processed from ${queueName}:`, message);
    } catch (error) {
      console.error(`Error processing task from ${queueName}:`, error);

      // Log the error for debugging
      await pool.query(
        'INSERT INTO task_logs (queue_name, task, processed_at, status, error) VALUES ($1, $2, NOW(), $3, $4)',
        [queueName, message, 'failure', error.message]
      );
    }
  });
};

/**
 * Default task handler for workers.
 * Simulates processing a task by executing business logic.
 * @param {string} task - The task message to process.
 * @returns {Promise<void>}
 */
const defaultTaskHandler = async (task) => {
  try {
    console.log(`Executing task: ${task}`);

    // Simulate task execution with a delay (replace with actual logic)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Task completed: ${task}`);
  } catch (error) {
    console.error(`Error executing task: ${error.message}`);
    throw error;
  }
};

module.exports = {
  startWorker,
  defaultTaskHandler,
};
