const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// Route to fetch all trips
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.TripID, 
        t.DepartureTime, 
        t.ArrivalTime, 
        t.SequenceNumber, 
        t.Active,
        tr.Name_English AS TrainName, 
        s1.Name AS OriginStation, 
        s2.Name AS DestinationStation 
      FROM Trip t
      INNER JOIN Train tr ON t.TrainID = tr.TrainID
      INNER JOIN Station s1 ON t.OriginStationID = s1.StationID
      INNER JOIN Station s2 ON t.DestinationStationID = s2.StationID;
    `;
    const result = await pool.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Route to create a new trip
router.post(
  '/create',
  [
    body('trainId').isInt().withMessage('Train ID must be an integer'),
    body('trackId').isInt().withMessage('Track ID must be an integer'),
    body('originStationId').isInt().withMessage('Origin Station ID must be an integer'),
    body('destinationStationId').isInt().withMessage('Destination Station ID must be an integer'),
    body('departureTime').isISO8601().withMessage('Departure time must be a valid datetime'),
    body('arrivalTime').isISO8601().withMessage('Arrival time must be a valid datetime'),
    body('sequenceNumber').isInt({ min: 1 }).withMessage('Sequence number must be a positive integer'),
    body('active').optional().isBoolean().withMessage('Active must be a boolean'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      trainId,
      trackId,
      originStationId,
      destinationStationId,
      departureTime,
      arrivalTime,
      sequenceNumber,
      active = true,
    } = req.body;

    try {
      const insertQuery = `
        INSERT INTO Trip (
          TripID, 
          TrainID, 
          TrackID, 
          OriginStationID, 
          DestinationStationID, 
          DepartureTime, 
          ArrivalTime, 
          SequenceNumber, 
          Active
        )
        VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING TripID;
      `;
      const result = await pool.query(insertQuery, [
        trainId,
        trackId,
        originStationId,
        destinationStationId,
        departureTime,
        arrivalTime,
        sequenceNumber,
        active,
      ]);

      res.status(201).json({
        success: true,
        message: 'Trip created successfully',
        tripId: result.rows[0].tripid,
      });
    } catch (error) {
      console.error('Error creating trip:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

module.exports = router;