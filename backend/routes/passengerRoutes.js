const express = require('express');
const router = express.Router();

// Example route to fetch passenger info
router.get('/:passengerId', (req, res) => {
  const { passengerId } = req.params;
  // Fetch passenger information logic here
  res.send(`Passenger details for ID: ${passengerId}`);
});

// Example route to update passenger information
router.put('/:passengerId', (req, res) => {
  const { passengerId } = req.params;
  const { name, contact } = req.body;
  // Update passenger info logic here
  res.send(`Passenger info updated for ID: ${passengerId}`);
});

// Export the router
module.exports = router;
