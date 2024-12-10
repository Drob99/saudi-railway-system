const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db'); // Database connection
const router = express.Router();

// Route to fetch passenger details
router.get('/:passengerId', async (req, res) => {
  const { passengerId } = req.params;

  try {
    const query = `
      SELECT 
        p.FName, 
        p.LName, 
        p.Email, 
        p.Phone, 
        ps.IdentificationDoc, 
        ps.LoyaltyKilometers 
      FROM Passenger ps
      INNER JOIN Person p ON ps.PersonID = p.PersonID
      WHERE ps.PersonID = $1;
    `;
    const result = await pool.query(query, [passengerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching passenger details:', error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Route to update passenger information
router.put(
  '/:passengerId',
  [
    body('fname').optional().isString().withMessage('First name must be a string'),
    body('lname').optional().isString().withMessage('Last name must be a string'),
    body('email').optional().isEmail().withMessage('A valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('identificationDoc').optional().isString().withMessage('Identification document must be a string'),
    body('loyaltyKilometers').optional().isInt({ min: 0 }).withMessage('Loyalty kilometers must be a non-negative integer'),
  ],
  async (req, res) => {
    const { passengerId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fname, lname, email, phone, identificationDoc, loyaltyKilometers } = req.body;

    try {
      // Update `Person` table
      const updatePersonQuery = `
        UPDATE Person
        SET 
          FName = COALESCE($1, FName), 
          LName = COALESCE($2, LName), 
          Email = COALESCE($3, Email), 
          Phone = COALESCE($4, Phone)
        WHERE PersonID = $5;
      `;
      await pool.query(updatePersonQuery, [fname, lname, email, phone, passengerId]);

      // Update `Passenger` table
      const updatePassengerQuery = `
        UPDATE Passenger
        SET 
          IdentificationDoc = COALESCE($1, IdentificationDoc), 
          LoyaltyKilometers = COALESCE($2, LoyaltyKilometers)
        WHERE PersonID = $3;
      `;
      await pool.query(updatePassengerQuery, [identificationDoc, loyaltyKilometers, passengerId]);

      res.status(200).json({ success: true, message: 'Passenger info updated successfully' });
    } catch (error) {
      console.error('Error updating passenger info:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

module.exports = router;