    const pool = require("../db");

    // Assign staff to a train
    const assignStaffToTrain = async (req, res) => {
    const { staffId, trainId, date, role } = req.body;

    if (!staffId || !trainId || !date || !role) {
        return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    try {
        // Ensure the staff member exists
        const staffQuery = "SELECT * FROM Staff WHERE PersonID = $1";
        const staffResult = await pool.query(staffQuery, [staffId]);
        if (staffResult.rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, error: "Staff member not found" });
        }

        // Assign or update the staff member's role for the train
        const assignQuery = `
        INSERT INTO Staff (PersonID, Roles, HireDate)
        VALUES ($1, $2, CURRENT_DATE)
        ON CONFLICT (PersonID)
        DO UPDATE SET Roles = $2, HireDate = CURRENT_DATE;
        `;
        await pool.query(assignQuery, [staffId, role]);

        res
        .status(200)
        .json({ success: true, message: "Staff assigned successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
    };

    // Promote waitlisted passengers
    const promoteWaitlistedPassengers = async (req, res) => {
    const { trainId, date } = req.body;

    if (!trainId || !date) {
        return res
        .status(400)
        .json({ success: false, error: "Train ID and date are required" });
    }

    try {
        // Fetch waitlisted passengers sorted by loyalty
        const waitlistQuery = `
        SELECT w.WaitingID, p.PersonID, p.LoyaltyKilometers
        FROM WaitingList w
        JOIN Booking b ON w.BookingID = b.BookingID
        JOIN Passenger p ON b.PassengerID = p.PersonID
        WHERE b.TrainID = $1 AND w.TravelDate = $2 AND w.Status = 'Pending'
        ORDER BY p.LoyaltyKilometers DESC;
        `;
        const waitlistResult = await pool.query(waitlistQuery, [trainId, date]);

        if (waitlistResult.rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, error: "No waitlisted passengers found" });
        }

        // Promote the passengers based on availability
        for (const passenger of waitlistResult.rows) {
        // Update waitlist status to 'Confirmed'
        const updateWaitlistQuery = `
            UPDATE WaitingList
            SET Status = 'Confirmed'
            WHERE WaitingID = $1;
        `;
        await pool.query(updateWaitlistQuery, [passenger.WaitingID]);
        }

        res
        .status(200)
        .json({
            success: true,
            message: "Waitlisted passengers promoted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
    };

    module.exports = {
    assignStaffToTrain,
    promoteWaitlistedPassengers,
    };
