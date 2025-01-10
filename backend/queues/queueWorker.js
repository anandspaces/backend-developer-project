const { processQueue } = require('./queueManager');

/**
 * Define the worker logic for processing messages from a queue.
 * @param {string} userId - The ID of the user whose queue is being processed.
 */
const startWorker = async (userId) => {
  try {
    console.log(`Starting worker for user: ${userId}`);

    // Define how to process each message
    const processMessage = async (message) => {
      console.log(`Worker processing message for user ${userId}: ${message}`);
      
      // Simulate some processing (e.g., saving to DB, handling a task, etc.)
      await handleTask(message);

      console.log(`Message processed successfully for user ${userId}: ${message}`);
    };

    // Start processing the user's queue
    await processQueue(userId, processMessage);
  } catch (error) {
    console.error(`Worker encountered an error for user ${userId}:`, error);
  }
};

/**
 * Simulates task handling logic for a message.
 * @param {string} message - The message to handle.
 * @returns {Promise<void>}
 */
const handleTask = async (message) => {
  return new Promise((resolve, reject) => {
    try {
      // Simulate task execution (replace with actual logic)
      console.log(`Handling task: ${message}`);
      setTimeout(() => {
        resolve();
      }, 1000); // Simulate 1-second processing time
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Start workers for multiple users.
 * @param {Array<string>} userIds - List of user IDs to start workers for.
 */
const startWorkersForUsers = async (userIds) => {
  for (const userId of userIds) {
    startWorker(userId);
  }
};

module.exports = {
  startWorker,
  startWorkersForUsers,
};
