const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

/**
 * @route POST /auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', registerUser);

/**
 * @route POST /auth/login
 * @description Authenticate user and return token
 * @access Public
 */
router.post('/login', loginUser);

module.exports = router;
