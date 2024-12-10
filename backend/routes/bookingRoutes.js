const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db'); // Import the database connection
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

// Fetch all bookings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.BookingID,
        b.Class,
        b.Status,
        b.Date,
        b.BaseFare,
        b.NumOfLuggage,
        b.SeatNumber,
        b.NumOfPassengers,
        b.TripID,
        b.TrainID,
        b.TrackID,
        b.OriginStationID,
        b.DestinationStationID,
        p.FName AS PassengerFirstName,
        p.LName AS PassengerLastName,
        s.FName AS StaffFirstName,
        s.LName AS StaffLastName
      FROM Booking b
      LEFT JOIN Person p ON b.PassengerID = p.PersonID
      LEFT JOIN Person s ON b.StaffID = s.PersonID
    `); // Fetch bookings with passenger and staff details
    res.status(200).send({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: 'Error fetching bookings' });
  }
});

// Create a new booking
router.post(
  '/create',
  [
    body('class').isIn(['Economy', 'Business']).withMessage('Class must be Economy or Business'),
    body('status').isIn(['Confirmed', 'Cancelled', 'Waiting']).withMessage('Invalid status'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('baseFare').isFloat({ min: 0 }).withMessage('BaseFare must be a positive number'),
    body('numOfLuggage').optional().isInt({ min: 0 }).withMessage('NumOfLuggage must be a non-negative integer'),
    body('seatNumber').isInt({ min: 1 }).withMessage('SeatNumber must be a positive integer'),
    body('numOfPassengers').optional().isInt({ min: 1 }).withMessage('NumOfPassengers must be at least 1'),
    body('tripId').isInt().withMessage('TripID must be an integer'),
    body('trainId').isInt().withMessage('TrainID must be an integer'),
    body('trackId').isInt().withMessage('TrackID must be an integer'),
    body('originStationId').isInt().withMessage('OriginStationID must be an integer'),
    body('destinationStationId').isInt().withMessage('DestinationStationID must be an integer'),
    body('passengerId').isInt().withMessage('PassengerID must be an integer'),
    body('staffId').optional().isInt().withMessage('StaffID must be an integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      class: bookingClass,
      status,
      date,
      baseFare,
      numOfLuggage = 0,
      seatNumber,
      numOfPassengers = 1,
      tripId,
      trainId,
      trackId,
      originStationId,
      destinationStationId,
      passengerId,
      staffId = null,
    } = req.body;

    try {
      const query = `
        INSERT INTO Booking (
          Class, Status, Date, BaseFare, NumOfLuggage, SeatNumber, NumOfPassengers, 
          TripID, TrainID, TrackID, OriginStationID, DestinationStationID, PassengerID, StaffID
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
      `;
      const values = [
        bookingClass, status, date, baseFare, numOfLuggage, seatNumber, numOfPassengers,
        tripId, trainId, trackId, originStationId, destinationStationId, passengerId, staffId,
      ];
      const result = await pool.query(query, values);

      res.status(201).send({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, error: 'Error creating booking' });
    }
  }
);

// Export the router
module.exports = router;
