const pool = require('../config/db');

const createUser = async (username, hashedPassword) => {
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
    await pool.query(query, [username, hashedPassword]);
};

const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const res = await pool.query(query, [username]);
    return res.rows[0];
};

module.exports = { createUser, findUserByUsername };
