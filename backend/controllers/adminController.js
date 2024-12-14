const pool = require("../db");

// Assign staff to a train
const assignStaffToTrain = async (req, res) => {
  const { staffId, trainId, role } = req.body;

  if (!staffId || !trainId || !role) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  try {
    const staffCheckQuery = "SELECT * FROM Staff WHERE PersonID = $1";
    const staffCheckResult = await pool.query(staffCheckQuery, [staffId]);
    if (staffCheckResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Staff member not found" });
    }

    const trainCheckQuery = "SELECT * FROM Train WHERE TrainID = $1";
    const trainCheckResult = await pool.query(trainCheckQuery, [trainId]);
    if (trainCheckResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Train not found" });
    }

    const assignQuery = `
      INSERT INTO TrainStaff (TrainID, PersonID, Role)
      VALUES ($1, $2, $3)
      ON CONFLICT (TrainID, PersonID)
      DO UPDATE SET Role = EXCLUDED.Role, AssignmentDate = CURRENT_DATE;
    `;
    await pool.query(assignQuery, [trainId, staffId, role]);

    res
      .status(200)
      .json({ success: true, message: "Staff assigned successfully" });
  } catch (error) {
    console.error("Error assigning staff:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Promote waitlisted passengers
const promoteWaitlistedPassengers = async (req, res) => {
  const { bookingId, newSeatNumber } = req.body;

  if (!bookingId || !newSeatNumber) {
    return res.status(400).json({
      success: false,
      error: "Booking ID and new seat number are required.",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if the booking exists and is waitlisted
    const waitlistQuery = `
      SELECT w.WaitingID, b.BookingID, w.Status AS waitlistStatus, b.Status AS bookingStatus,
             b.TripID, b.TrainID
      FROM WaitingList w
      JOIN Booking b ON w.BookingID = b.BookingID
      WHERE b.BookingID = $1 AND w.Status = 'Pending' AND b.Status = 'Waiting';
    `;
    const waitlistResult = await client.query(waitlistQuery, [bookingId]);

    if (waitlistResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, error: "No waitlisted booking found." });
    }

    const { tripid: tripId, trainid: trainId } = waitlistResult.rows[0];

    // Check if the new seat is available
    const seatCheckQuery = `
      SELECT BookingID 
      FROM Booking
      WHERE SeatNumber = $1 AND TripID = $2 AND TrainID = $3 AND Status = 'Confirmed';
    `;
    const seatCheckResult = await client.query(seatCheckQuery, [
      newSeatNumber,
      tripId,
      trainId,
    ]);

    if (seatCheckResult.rowCount > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
          success: false,
          error: "The selected seat is already booked.",
        });
    }

    // Update Booking with the new seat and set status to 'Confirmed'
    const updateSeatQuery = `
      UPDATE Booking
      SET SeatNumber = $1, Status = 'Confirmed'
      WHERE BookingID = $2;
    `;
    await client.query(updateSeatQuery, [newSeatNumber, bookingId]);

    // Update WaitingList status to 'Confirmed'
    const updateWaitlistQuery = `
      UPDATE WaitingList
      SET Status = 'Confirmed'
      WHERE BookingID = $1;
    `;
    await client.query(updateWaitlistQuery, [bookingId]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Waitlisted booking promoted successfully with the new seat.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error promoting waitlisted booking:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};



module.exports = {
  assignStaffToTrain,
  promoteWaitlistedPassengers,
};
