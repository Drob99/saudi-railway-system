const pool = require("../db");

/**
 * Search for available trains based on origin city, destination city, date, and class.
 * @param {import('express').Request} req - The request object containing query parameters.
 * @param {import('express').Response} res - The response object to send results.
 */
const searchTrains = async (req, res) => {
  const {
    originCity,
    destinationCity,
    departureDate,
    class: trainClass,
  } = req.query;

  // Validate required inputs
  if (!originCity || !destinationCity || !departureDate || !trainClass) {
    return res.status(400).json({
      success: false,
      message:
        "originCity, destinationCity, departureDate, and class are required.",
    });
  }

  try {
    // Fetch the station IDs for the provided city names
    const stationQuery = `
      SELECT s.StationID, c.Name AS CityName
      FROM Station s
      JOIN City c ON s.CityID = c.CityID
      WHERE c.Name = $1 OR c.Name = $2;
    `;

    const stationResult = await pool.query(stationQuery, [
      originCity,
      destinationCity,
    ]);

    if (stationResult.rows.length < 2) {
      return res.status(404).json({
        success: false,
        message:
          "Could not find both the origin and destination cities in the database.",
      });
    }

    const originStationId = stationResult.rows.find(
      (row) => row.cityname === originCity
    )?.stationid;
    const destinationStationId = stationResult.rows.find(
      (row) => row.cityname === destinationCity
    )?.stationid;

    if (!originStationId || !destinationStationId) {
      return res.status(404).json({
        success: false,
        message:
          "Could not map the provided cities to their respective stations.",
      });
    }

    // Main query to fetch train details
    const query = `
      SELECT 
        tr.TripID,
        t.TrainID, 
        t.Name_English AS TrainNameEnglish, 
        t.Name_Arabic AS TrainNameArabic, 
        tr.DepartureTime, 
        tr.ArrivalTime, 
        CASE 
          WHEN $4 = 'Economy' THEN t.Capacity_Economy - COALESCE(SUM(CASE WHEN b.Class = 'Economy' THEN 1 ELSE 0 END), 0)
          WHEN $4 = 'Business' THEN t.Capacity_Business - COALESCE(SUM(CASE WHEN b.Class = 'Business' THEN 1 ELSE 0 END), 0)
          ELSE 0 
        END AS AvailableSeats,
        CASE 
          WHEN $4 = 'Economy' THEN 50.00 
          WHEN $4 = 'Business' THEN 75.00 
          ELSE NULL 
        END AS TicketPrice
      FROM Trip tr
      JOIN Train t ON t.TrainID = tr.TrainID
      LEFT JOIN Booking b ON b.TripID = tr.TripID
      WHERE 
        tr.OriginStationID = $1 
        AND tr.DestinationStationID = $2 
        AND DATE(tr.DepartureTime) = $3
        AND tr.Active = TRUE
      GROUP BY 
        tr.TripID,
        t.TrainID, 
        t.Name_English, 
        t.Name_Arabic, 
        t.Capacity_Economy, 
        t.Capacity_Business, 
        tr.DepartureTime, 
        tr.ArrivalTime;
    `;

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
      error: error.message,
    });
  }
};
;

module.exports = { searchTrains };
