const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * @function hashPassword
 * @description Hashes the user's password using bcrypt.
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} The hashed password.
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * @function comparePasswords
 * @description Compares a plaintext password with a hashed password.
 * @param {string} password - The plaintext password.
 * @param {string} hashedPassword - The hashed password.
 * @returns {Promise<boolean>} Whether the passwords match.
 */
const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * @function generateToken
 * @description Generates a JWT for the user.
 * @param {Object} user - The user object (should include user id or other unique identifier).
 * @returns {string} The generated JWT.
 */
const generateToken = (user) => {
  const payload = { id: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * @function validateToken
 * @description Validates a given JWT and returns the decoded payload.
 * @param {string} token - The JWT token.
 * @returns {Object} The decoded token payload.
 * @throws Will throw an error if the token is invalid or expired.
 */
const validateToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * @function registerUser
 * @description Registers a new user by hashing their password and saving them to the database.
 * @param {Object} userData - The user details (email, password, etc.).
 * @returns {Promise<Object>} The saved user object.
 */
const registerUser = async (userData) => {
  const { email, password } = userData;

  // Check if the user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash the password and save the user
  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({ ...userData, password: hashedPassword });

  return newUser;
};

/**
 * @function authenticateUser
 * @description Authenticates a user by validating their credentials.
 * @param {string} email - The user's email.
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} A JWT token if authentication succeeds.
 * @throws Will throw an error if authentication fails.
 */
const authenticateUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  return generateToken(user);
};

module.exports = {
  hashPassword,
  comparePasswords,
  generateToken,
  validateToken,
  registerUser,
  authenticateUser,
};
