const pool = require("../db");

// Report Controller
const reportController = {
  // 1. Current active trains that are on their way today (for all users)
  getActiveTrainsToday: async (req, res) => {
    try {
      const query = `
        SELECT t.TrainID, t.Name_English, t.Name_Arabic, tr.DepartureTime, tr.ArrivalTime
        FROM Train t
        JOIN Trip tr ON t.TrainID = tr.TrainID
        WHERE tr.Active = TRUE AND DATE(tr.DepartureTime) = CURRENT_DATE;
      `;
      const result = await pool.query(query);
      res.status(200).json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("Error fetching active trains:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  // 2. List stations for each train (for admins)
  getStationsForTrain: async (req, res) => {
    const { trainId } = req.params;
    if (!trainId) {
      return res
        .status(400)
        .json({ success: false, error: "Train ID is required" });
    }

    try {
      const query = `
      SELECT 
        s.Name AS StationName,
        c.Name AS CityName,
        CASE 
          WHEN s.StationID = tr.OriginStationID THEN 'Origin'
          WHEN s.StationID = tr.DestinationStationID THEN 'Destination'
        END AS StationType,
        tr.SequenceNumber
      FROM Trip tr
      JOIN Station s 
        ON s.StationID = tr.OriginStationID OR s.StationID = tr.DestinationStationID
      JOIN City c 
        ON c.CityID = s.CityID
      WHERE tr.TrainID = $1
      ORDER BY tr.SequenceNumber;
      `;
      const result = await pool.query(query, [trainId]);
      res.status(200).json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("Error fetching stations for train:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  // 3. Reservation details given passenger ID (for passengers)
  getReservationDetails: async (req, res) => {
    const { passengerId } = req.params;
    if (!passengerId) {
      return res
        .status(400)
        .json({ success: false, error: "Passenger ID is required" });
    }

    try {
      const query = `
SELECT 
  b.*,
  t.Name_English AS TrainName,
  os.Name AS OriginStation,
  ds.Name AS DestinationStation,
  d.Name AS DependentName
FROM Booking b
JOIN Train t ON t.TrainID = b.TrainID
JOIN Station os ON os.StationID = b.OriginStationID
JOIN Station ds ON ds.StationID = b.DestinationStationID
LEFT JOIN Dependent d ON d.DepID = b.DependentID
WHERE b.PassengerID = $1;

      `;
      const result = await pool.query(query, [passengerId]);
      res.status(200).json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("Error fetching reservation details:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  // 4. Waitlisted loyalty passengers in each class given a train number (for admins)
  getWaitlistedLoyaltyPassengers: async (req, res) => {
    const { trainId } = req.params;
    if (!trainId) {
      return res
        .status(400)
        .json({ success: false, error: "Train ID is required" });
    }

    try {
      const query = `
        SELECT p.FName, p.LName, p.Email, b.Class, pa.LoyaltyKilometers
        FROM WaitingList w
        JOIN Booking b ON w.BookingID = b.BookingID
        JOIN Passenger pa ON pa.PersonID = b.PassengerID
        JOIN Person p ON p.PersonID = pa.PersonID
        WHERE b.TrainID = $1
        ORDER BY b.Class, pa.LoyaltyKilometers DESC;
      `;
      const result = await pool.query(query, [trainId]);
      res.status(200).json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("Error fetching waitlisted loyalty passengers:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  // 5. Average load factor for each train on a given date (for admins)
  getAverageLoadFactor: async (req, res) => {
  const { date } = req.query; // Extract date from query params

  if (!date) {
    return res.status(400).json({ error: 'Date parameter is required' });
  }

  try {
    const query = `
SELECT
  t.TrainID,
  t.Name_English AS TrainName,
  t.Capacity_Economy,
  t.Capacity_Business,
  SUM(CASE WHEN b.Class = 'Economy' AND b.Status = 'Confirmed' THEN 1 ELSE 0 END) AS EconomySeatsOccupied,
  SUM(CASE WHEN b.Class = 'Business' AND b.Status = 'Confirmed' THEN 1 ELSE 0 END) AS BusinessSeatsOccupied,
  ROUND(
    SUM(CASE WHEN b.Class = 'Economy' AND b.Status = 'Confirmed' THEN 1 ELSE 0 END) * 100.0 / t.Capacity_Economy,
    2
  ) AS EconomyLoadFactorPercentage,
  ROUND(
    SUM(CASE WHEN b.Class = 'Business' AND b.Status = 'Confirmed' THEN 1 ELSE 0 END) * 100.0 / t.Capacity_Business,
    2
  ) AS BusinessLoadFactorPercentage
FROM Train t
LEFT JOIN Booking b ON t.TrainID = b.TrainID AND b.Date = $1
GROUP BY t.TrainID, t.Name_English, t.Capacity_Economy, t.Capacity_Business
ORDER BY t.TrainID;

    `;

    const { rows } = await pool.query(query, [date]);

    res.status(200).json({
      date,
      trains: rows,
    });
  } catch (error) {
    console.error('Error fetching load factor:', error);
    res.status(500).json({ error: 'An error occurred while fetching load factors' });
  }
},

// 6. List of dependents travelling on a given date in all trains (for admins)
getDependentsOnDate: async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res
      .status(400)
      .json({ success: false, error: "Date is required" });
  }

  try {
    const query = `
SELECT 
  d.Name AS DependentName,
  d.Relationship,
  b.TrainID,
  t.Name_English AS TrainName
FROM Dependent d
JOIN Booking b ON d.DepID = b.DependentID
JOIN Train t ON t.TrainID = b.TrainID
WHERE DATE(b.Date) = $1;
    `;
    const result = await pool.query(query, [date]);
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching dependents:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}


};

module.exports = reportController;
