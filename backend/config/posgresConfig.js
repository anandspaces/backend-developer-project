const { Pool } = require('pg'); // Importing the Pool module from the pg library
require('dotenv').config(); // Load environment variables from .env file

// Create a new PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,      // Database user from environment variable
  host: process.env.POSTGRES_HOST,      // Database host from environment variable
  database: process.env.POSTGRES_DB,    // Database name from environment variable
  password: process.env.POSTGRES_PASSWORD, // Database password from environment variable
  port: process.env.POSTGRES_PORT || 5432, // Default to port 5432 if not set in .env
});

// Function to query the PostgreSQL database using the pool
async function queryPostgres(query, params = []) {
  try {
    // Get a client from the pool to execute the query
    const client = await pool.connect();
    try {
      // Execute the query and return the result
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err;
  }
}

// Function to close the PostgreSQL connection pool
function closePostgresPool() {
  return pool.end()
    .then(() => console.log('PostgreSQL pool closed successfully.'))
    .catch((err) => console.error('Error closing PostgreSQL pool:', err.stack));
}

module.exports = {
  queryPostgres,
  closePostgresPool,
};
