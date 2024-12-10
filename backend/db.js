const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

// Check for DATABASE_URL in environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

// Create a database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if a connection cannot be established in 2 seconds
});

// Test the database connection (only in development mode)
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      console.log('Testing database connection...');
      const result = await pool.query('SELECT NOW()');
      console.log('Database connected successfully. Current time:', result.rows[0].now);
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
    }
  })();
}

// Graceful shutdown of the database pool
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await pool.end();
  console.log('Database connection closed');
  process.exit(0);
});

module.exports = pool;
