const express = require('express');
const router = express.Router();

// Example route to fetch all bookings
router.get('/', (req, res) => {
  res.send('List of bookings');
});

// Example route to create a new booking
router.post('/create', (req, res) => {
  const { passengerName, tripId, seatNumber } = req.body;
  // Insert booking logic here
  res.send(`Booking created for ${passengerName} on trip ID: ${tripId}`);
});

// Export the router
module.exports = router;
