const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

// Database connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://SaudiRailwaysSystem_owner:qRA8uemT2aMg@ep-wild-frog-a5w1q21s.us-east-2.aws.neon.tech/SaudiRailwaysSystem?sslmode=require';

// Create a database connection pool
const pool = new Pool({
  connectionString,
});

// Test the database connection
(async () => {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully. Current time:', result.rows[0].now);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await pool.end(); // Close the pool after the test
    console.log('Database connection closed');
  }
})();

module.exports = pool;
