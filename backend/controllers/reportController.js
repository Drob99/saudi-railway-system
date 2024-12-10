const pool = require("../db");

// Fetch active trains
exports.getActiveTrains = async (req, res) => {
try {
const query = `
    SELECT TrainID, Name_English, Name_Arabic
    FROM Train
    WHERE TrainID IN (
    SELECT TrainID FROM Trip WHERE Active = TRUE AND CURRENT_DATE = DATE(DepartureTime)
    );
`;
const result = await pool.query(query);
res.status(200).json({ success: true, data: result.rows });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};

// Fetch stations for a train
exports.getTrainStations = async (req, res) => {
const { trainId } = req.params;
try {
const query = `
    SELECT s.StationID, s.Name AS StationName, c.Name AS CityName
    FROM Trip t
    JOIN Track tr ON t.TrackID = tr.TrackID
    JOIN Station s ON s.StationID = tr.OriginStationID OR s.StationID = tr.DestinationStationID
    JOIN City c ON s.CityID = c.CityID
    WHERE t.TrainID = $1;
`;
const result = await pool.query(query, [trainId]);
res.status(200).json({ success: true, data: result.rows });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};

// Fetch reservation details by passenger ID
exports.getPassengerReservations = async (req, res) => {
const { passengerId } = req.params;
try {
const query = `
    SELECT b.BookingID, b.Class, b.Status, b.Date, t.DepartureTime, t.ArrivalTime
    FROM Booking b
    JOIN Trip t ON b.TripID = t.TripID
    WHERE b.PassengerID = $1;
`;
const result = await pool.query(query, [passengerId]);
res.status(200).json({ success: true, data: result.rows });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};

// Fetch waitlisted loyalty passengers
exports.getWaitlistedLoyaltyPassengers = async (req, res) => {
try {
const query = `
    SELECT p.PersonID, p.FName, p.LName, pa.LoyaltyKilometers
    FROM Passenger pa
    JOIN Person p ON pa.PersonID = p.PersonID
    JOIN Booking b ON pa.PersonID = b.PassengerID
    WHERE b.Status = 'Waiting'
    ORDER BY pa.LoyaltyKilometers DESC;
`;
const result = await pool.query(query);
res.status(200).json({ success: true, data: result.rows });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};

// Fetch average load factor per train
exports.getAverageLoadFactor = async (req, res) => {
try {
const query = `
    SELECT t.TrainID, t.Name_English, 
            ROUND((SUM(b.NumOfPassengers)::DECIMAL / NULLIF(SUM(t.Capacity_Economy + t.Capacity_Business), 0)) * 100, 2) AS LoadFactor
    FROM Train t
    JOIN Booking b ON t.TrainID = b.TrainID
    GROUP BY t.TrainID, t.Name_English;
`;
const result = await pool.query(query);
res.status(200).json({ success: true, data: result.rows });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};

// Fetch dependents traveling on a given date
exports.getDependentsTravelingOnDate = async (req, res) => {
const { date } = req.query; // Accept date as query parameter
try {
const query = `
    SELECT d.Name AS DependentName, d.Relationship, p.FName AS PassengerFirstName, p.LName AS PassengerLastName
    FROM Dependent d
    JOIN Booking b ON d.PersonID = b.PassengerID
    JOIN Person p ON d.PersonID = p.PersonID
    WHERE b.Date = $1;
`;
const result = await pool.query(query, [date]);
res.status(200).json({ success: true, data: result.rows });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};
