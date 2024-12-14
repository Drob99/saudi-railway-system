const pool = require("../db");

/**
 * Get seat availability for a specific trip and class type via GET request.
 * Returns an object where keys are seat numbers and values are boolean (true if booked, false if free).
 */
const getSeatAvailability = async (req, res) => {
  const { tripId, classType } = req.query;

  // Validate input
  if (!tripId || !classType) {
    return res.status(400).json({
      success: false,
      message: "Required query parameters are missing: tripId, classType.",
    });
  }

  try {
    // Fetch train ID and capacity for the given trip
    const tripQuery = `
      SELECT 
        t.TrainID,
        CASE 
          WHEN $1 = 'Economy' THEN t.Capacity_Economy
          WHEN $1 = 'Business' THEN t.Capacity_Business
          ELSE NULL 
        END AS TotalSeats
      FROM Trip tr
      JOIN Train t ON t.TrainID = tr.TrainID
      WHERE tr.TripID = $2;
    `;
    const tripResult = await pool.query(tripQuery, [classType, tripId]);

    if (tripResult.rowCount === 0 || tripResult.rows[0].totalseats === null) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or invalid class type.",
      });
    }

    const { totalseats: totalSeats } = tripResult.rows[0];

    // Fetch booked seats for the given trip and class type
    const bookedSeatsQuery = `
      SELECT SeatNumber
      FROM Booking
      WHERE TripID = $1 AND Class = $2;
    `;
    const bookedSeatsResult = await pool.query(bookedSeatsQuery, [tripId, classType]);

    // Create the seat availability object
    const seatAvailability = {};
    for (let i = 1; i <= totalSeats; i++) {
      seatAvailability[i] = false; // Initialize all seats as free
    }

    bookedSeatsResult.rows.forEach(row => {
      seatAvailability[row.seatnumber] = true; // Mark booked seats
    });

    res.status(200).json({
      success: true,
      seatAvailability,
    });
  } catch (error) {
    console.error("Error fetching seat availability:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Fetch a passenger and their dependents by passenger ID.
 * @param {import('express').Request} req - The request object containing passenger ID as a parameter.
 * @param {import('express').Response} res - The response object to send results.
 */
const getPassengerAndDependents = async (req, res) => {
  const { passengerId } = req.params;

  // Validate input
  if (!passengerId) {
    return res.status(400).json({
      success: false,
      message: "Passenger ID is required.",
    });
  }

  try {
    // Fetch passenger information
    const passengerQuery = `
      SELECT 
        p.PersonID, 
        p.FName, 
        p.MInit, 
        p.LName, 
        p.Email, 
        p.Phone, 
        pa.IdentificationDoc, 
        pa.LoyaltyKilometers
      FROM Passenger pa
      JOIN Person p ON pa.PersonID = p.PersonID
      WHERE pa.PersonID = $1;
    `;
    const passengerResult = await pool.query(passengerQuery, [passengerId]);

    if (passengerResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found.",
      });
    }

    const passenger = passengerResult.rows[0];

    // Fetch dependents information
    const dependentsQuery = `
      SELECT 
        d.DepID, 
        d.Name, 
        d.Relationship
      FROM Dependent d
      WHERE d.PersonID = $1;
    `;
    const dependentsResult = await pool.query(dependentsQuery, [passengerId]);

    const dependents = dependentsResult.rows;

    // Respond with combined data
    res.status(200).json({
      success: true,
      data: {
        Passenger: passenger,
        Dependents: dependents,
      },
    });
  } catch (error) {
    console.error("Error fetching passenger and dependents:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Get all passenger details with optional filtering and pagination.
 */
const getAllPassengers = async (req, res) => {
  const { fname, lname, email, phone, personId, identificationDoc, page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;

    // Base query
    let query = `
      SELECT 
        p.PersonID,
        p.FName,
        p.MInit,
        p.LName,
        p.Email,
        p.Phone,
        pa.IdentificationDoc,
        pa.LoyaltyKilometers
      FROM Passenger pa
      JOIN Person p ON pa.PersonID = p.PersonID
    `;
    
    // Conditions array for filtering
    const conditions = [];
    const values = [];

    if (fname) {
      conditions.push(`p.FName ILIKE $${values.length + 1}`);
      values.push(`%${fname}%`);
    }
    if (lname) {
      conditions.push(`p.LName ILIKE $${values.length + 1}`);
      values.push(`%${lname}%`);
    }
    if (email) {
      conditions.push(`p.Email ILIKE $${values.length + 1}`);
      values.push(`%${email}%`);
    }
    if (phone) {
      conditions.push(`p.Phone ILIKE $${values.length + 1}`);
      values.push(`%${phone}%`);
    }
    if (personId) {
      conditions.push(`p.PersonID = $${values.length + 1}`);
      values.push(personId);
    }
    if (identificationDoc) {
      conditions.push(`pa.IdentificationDoc ILIKE $${values.length + 1}`);
      values.push(`%${identificationDoc}%`);
    }

    // Append conditions to the query
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add pagination
    query += ` ORDER BY p.PersonID LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: "Passengers fetched successfully.",
      passengers: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching passengers:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Get all reservation details with optional filtering and pagination.
 */
const getAllReservations = async (req, res) => {
  const {
    bookingId,
    class: bookingClass,
    status,
    passengerId,
    tripId,
    trainId,
    date,
    page = 1,
    limit = 10,
  } = req.query;

  try {
    const offset = (page - 1) * limit;

    // Base query
    let query = `
      SELECT 
        b.BookingID,
        b.Class,
        b.Status,
        b.Date,
        b.BaseFare,
        b.NumOfLuggage,
        b.SeatNumber,
        b.DependentID,
        b.TripID,
        b.TrainID,
        b.TrackID,
        b.OriginStationID,
        b.DestinationStationID,
        b.PassengerID,
        NULL AS StaffID,
        CONCAT(p.FName, ' ', COALESCE(p.MInit || '.', ''), ' ', p.LName) AS PassengerFullName,
        COALESCE(json_agg(
          DISTINCT CONCAT(d.Name, ' (', d.Relationship, ')')
        ) FILTER (WHERE d.DepID IS NOT NULL), '[]') AS Dependents,
        py.Status AS PaymentStatus
      FROM Booking b
      JOIN Passenger pa ON b.PassengerID = pa.PersonID
      JOIN Person p ON pa.PersonID = p.PersonID
      LEFT JOIN Dependent d ON d.PersonID = p.PersonID
      LEFT JOIN Payment py ON py.BookingID = b.BookingID
    `;

    // Conditions array for filtering
    const conditions = [];
    const values = [];

    if (bookingId) {
      conditions.push(`b.BookingID = $${values.length + 1}`);
      values.push(bookingId);
    }
    if (bookingClass) {
      conditions.push(`b.Class = $${values.length + 1}`);
      values.push(bookingClass);
    }
    if (status) {
      conditions.push(`b.Status = $${values.length + 1}`);
      values.push(status);
    }
    if (passengerId) {
      conditions.push(`b.PassengerID = $${values.length + 1}`);
      values.push(passengerId);
    }
    if (tripId) {
      conditions.push(`b.TripID = $${values.length + 1}`);
      values.push(tripId);
    }
    if (trainId) {
      conditions.push(`b.TrainID = $${values.length + 1}`);
      values.push(trainId);
    }
    if (date) {
      conditions.push(`b.Date = $${values.length + 1}`);
      values.push(date);
    }

    // Append conditions to the query
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Group by BookingID to aggregate dependents
    query += `
      GROUP BY b.BookingID, p.PersonID, py.Status
      ORDER BY b.BookingID DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: "Reservations fetched successfully.",
      reservations: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching reservations:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
    getSeatAvailability, 
  getPassengerAndDependents,
  getAllPassengers,
    getAllReservations
};
