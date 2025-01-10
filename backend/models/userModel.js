const pool = require('../config/postgresConfig');
const bcrypt = require('bcrypt'); // For hashing passwords

/**
 * Create a new user.
 * @param {string} username - The username of the user.
 * @param {string} password - The plaintext password of the user.
 * @returns {Promise<object>} - The created user record.
 */
const createUser = async (username, password) => {
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username`,
      [username, hashedPassword]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user.');
  }
};

/**
 * Authenticate a user by username and password.
 * @param {string} username - The username of the user.
 * @param {string} password - The plaintext password provided by the user.
 * @returns {Promise<object|null>} - The authenticated user record or null if authentication fails.
 */
const authenticateUser = async (username, password) => {
  try {
    const result = await pool.query(
      `SELECT id, username, password FROM users WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    if (!user) return null;

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return { id: user.id, username: user.username };
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw new Error('Failed to authenticate user.');
  }
};

/**
 * Get user details by ID.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object|null>} - The user record or null if not found.
 */
const getUserById = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT id, username FROM users WHERE id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Failed to fetch user.');
  }
};

/**
 * Check if a username already exists.
 * @param {string} username - The username to check.
 * @returns {Promise<boolean>} - True if the username exists, otherwise false.
 */
const isUsernameTaken = async (username) => {
  try {
    const result = await pool.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error checking username:', error);
    throw new Error('Failed to check username.');
  }
};

module.exports = {
  createUser,
  authenticateUser,
  getUserById,
  isUsernameTaken,
};
