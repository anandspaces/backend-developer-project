const express = require('express');
const { enqueueRequest, getQueueStatus } = require('../controllers/queueController');
const { authenticateUser } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @route POST /requests/enqueue
 * @description Enqueue a new request for the authenticated user
 * @access Private
 */
router.post('/enqueue', authenticateUser, enqueueRequest);

/**
 * @route GET /requests/status
 * @description Get the status of the user's request queue
 * @access Private
 */
router.get('/status', authenticateUser, getQueueStatus);

module.exports = router;
