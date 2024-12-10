 const { Client } = require('pg');

// Replace with your Neon database connection string
const connectionString = 'postgresql://SaudiRailwaysSystem_owner:qRA8uemT2aMg@ep-wild-frog-a5w1q21s.us-east-2.aws.neon.tech/SaudiRailwaysSystem?sslmode=require';

const client = new Client({
  connectionString: connectionString,
});


  client.connect()
  .then(() => {
    console.log('Connected to the Neon database');
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  })
  .finally(() => {
    client.end(); // This ensures the connection is always closed
    console.log('Database connection closed');
  });

  module.exports = client;
