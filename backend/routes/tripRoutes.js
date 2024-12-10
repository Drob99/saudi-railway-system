const express = require('express');
const router = express.Router();

// Example route to fetch all trips
router.get('/', (req, res) => {
  res.send('List of trips');
});

// Example route to create a new trip
router.post('/create', (req, res) => {
  const { tripName, origin, destination, date } = req.body;
  // Insert trip creation logic here
  res.send(`Trip created: ${tripName} from ${origin} to ${destination}`);
});

// Export the router
module.exports = router;
