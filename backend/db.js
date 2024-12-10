const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

// Database connection string
const connectionString = process.env.DATABASE_URL;

// Create a database connection pool
const pool = new Pool({
  connectionString,
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
module.exports = pool;
