const pool = require("../db");

/**
 * Search for available trains based on origin, destination, date, and class.
 * @param {import('express').Request} req - The request object containing query parameters.
 * @param {import('express').Response} res - The response object to send results.
 */
const searchTrains = async (req, res) => {
  const {
    originStationId,
    destinationStationId,
    departureDate,
    class: trainClass,
  } = req.query;

  // Validate required inputs
  if (
    !originStationId ||
    !destinationStationId ||
    !departureDate ||
    !trainClass
  ) {
    return res.status(400).json({
      success: false,
      message:
        "originStationId, destinationStationId, departureDate, and class are required.",
    });
  }

  try {
    // Query to find available trains matching the criteria
    const query = `
SELECT 
    t.TrainID, 
    t.Name_English, 
    t.Name_Arabic, 
    tr.DepartureTime, 
    tr.ArrivalTime, 
    tr.OriginStationID, 
    tr.DestinationStationID,
    CASE 
        WHEN $4 = 'Economy' THEN (t.Capacity_Economy - COUNT(b.BookingID)) 
        WHEN $4 = 'Business' THEN (t.Capacity_Business - COUNT(b.BookingID))
        ELSE 0 
    END AS AvailableSeats
FROM Trip tr
JOIN Train t ON t.TrainID = tr.TrainID
LEFT JOIN Booking b ON b.TripID = tr.TripID AND b.Class = $4
WHERE 
    tr.OriginStationID = $1 
    AND tr.DestinationStationID = $2 
    AND DATE(tr.DepartureTime) = $3
    AND tr.Active = TRUE
GROUP BY 
    t.TrainID, 
    t.Name_English, 
    t.Name_Arabic, 
    tr.DepartureTime, 
    tr.ArrivalTime, 
    tr.OriginStationID, 
    tr.DestinationStationID
    `;

    // Execute the query with provided parameters
    const result = await pool.query(query, [
      originStationId,
      destinationStationId,
      departureDate,
      trainClass,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trains available for the given criteria.",
      });
    }

    // Respond with available trains
    res.status(200).json({
      success: true,
      message: "Trains found successfully.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error searching for trains:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error:error
    });
  }
};

module.exports = { searchTrains };
