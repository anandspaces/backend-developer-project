const { consumeFromQueue, sendToQueue } = require('../config/rabbitmqConfig');
const pool = require('../config/postgresConfig'); // For logging or database persistence
require('dotenv').config();

// Map to track processing state for each user's queue
const processingState = new Map();

/**
 * Creates a queue for a specific user.
 * @param {string} userId - The unique identifier of the user.
 * @returns {string} The name of the queue created for the user.
 */
const createQueue = (userId) => {
  const queueName = `queue_${userId}`;
  console.log(`Queue created for user: ${queueName}`);
  return queueName;
};

/**
 * Adds a task to a user's queue.
 * @param {string} userId - The unique identifier of the user.
 * @param {object} task - The task to be added to the queue.
 * @returns {Promise<void>}
 */
const addToQueue = async (userId, task) => {
  try {
    const queueName = createQueue(userId);
    const message = JSON.stringify(task);

    await sendToQueue(queueName, message);
    console.log(`Task added to ${queueName}:`, task);
  } catch (error) {
    console.error(`Failed to add task to queue for user ${userId}:`, error);
  }
};

/**
 * Processes tasks sequentially from a user's queue.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<void>}
 */
const processQueue = async (userId) => {
  const queueName = createQueue(userId);

  if (processingState.get(queueName)) {
    console.log(`Queue ${queueName} is already being processed.`);
    return;
  }

  processingState.set(queueName, true); // Mark as processing

  try {
    await consumeFromQueue(queueName, async (message) => {
      console.log(`Processing task from ${queueName}:`, message);

      // Simulate task execution (replace this with actual task logic)
      await executeTask(message);

      console.log(`Task completed for ${queueName}:`, message);
    });
  } catch (error) {
    console.error(`Error processing queue ${queueName}:`, error);
  } finally {
    processingState.set(queueName, false); // Mark as not processing
  }
};

/**
 * Simulates task execution logic.
 * @param {string} task - The task message to execute.
 * @returns {Promise<void>}
 */
const executeTask = async (task) => {
  try {
    // Simulate a delay to mimic task processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Optionally, log task execution in the database
    await pool.query(
      'INSERT INTO task_logs (task, processed_at) VALUES ($1, NOW())',
      [task]
    );
  } catch (error) {
    console.error('Error executing task:', error);
  }
};

module.exports = {
  addToQueue,
  processQueue,
};
