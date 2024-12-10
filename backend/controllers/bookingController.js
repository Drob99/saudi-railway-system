const pool = require("../db");

/**
 * Create a new booking.
 */
const createBooking = async (req, res) => {
const {
    class: bookingClass,
    date,
    baseFare,
    numOfLuggage,
    seatNumber,
    numOfPassengers,
    tripId,
    trainId,
    trackId,
    originStationId,
    destinationStationId,
    passengerId,
    staffId,
} = req.body;

if (
    !bookingClass ||
    !date ||
    !baseFare ||
    !seatNumber ||
    !tripId ||
    !trainId ||
    !trackId ||
    !originStationId ||
    !destinationStationId ||
    !passengerId
) {
    return res
    .status(400)
    .json({ success: false, message: "Required fields are missing." });
}

try {
    const query = `
    INSERT INTO Booking (Class, Date, BaseFare, NumOfLuggage, SeatNumber, NumOfPassengers, TripID, TrainID, TrackID, OriginStationID, DestinationStationID, PassengerID, StaffID)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING BookingID;
    `;
    const values = [
    bookingClass,
    date,
    baseFare,
    numOfLuggage,
    seatNumber,
    numOfPassengers,
    tripId,
    trainId,
    trackId,
    originStationId,
    destinationStationId,
    passengerId,
    staffId,
    ];

    const result = await pool.query(query, values);

    res
    .status(201)
    .json({
        success: true,
        message: "Booking created successfully.",
        bookingId: result.rows[0].bookingid,
    });
} catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
}
};

/**
 * Update an existing booking.
 */
const updateBooking = async (req, res) => {
const { bookingId } = req.params;
const {
    class: bookingClass,
    seatNumber,
    numOfPassengers,
    baseFare,
    numOfLuggage,
} = req.body;

try {
    const query = `
    UPDATE Booking
    SET Class = $1, SeatNumber = $2, NumOfPassengers = $3, BaseFare = $4, NumOfLuggage = $5
    WHERE BookingID = $6
    RETURNING *;
    `;
    const values = [
    bookingClass,
    seatNumber,
    numOfPassengers,
    baseFare,
    numOfLuggage,
    bookingId,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
    return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    res
    .status(200)
    .json({
        success: true,
        message: "Booking updated successfully.",
        booking: result.rows[0],
    });
} catch (error) {
    console.error("Error updating booking:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
}
};

/**
 * Cancel a booking.
 */
const cancelBooking = async (req, res) => {
const { bookingId } = req.params;

try {
    const query = `
    UPDATE Booking
    SET Status = 'Cancelled'
    WHERE BookingID = $1
    RETURNING *;
    `;
    const result = await pool.query(query, [bookingId]);

    if (result.rowCount === 0) {
    return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    res
    .status(200)
    .json({
        success: true,
        message: "Booking cancelled successfully.",
        booking: result.rows[0],
    });
} catch (error) {
    console.error("Error cancelling booking:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
}
};

/**
 * Get booking details.
 */
const getBookingDetails = async (req, res) => {
const { bookingId } = req.params;

try {
    const query = `
    SELECT *
    FROM Booking
    WHERE BookingID = $1;
    `;
    const result = await pool.query(query, [bookingId]);

    if (result.rowCount === 0) {
    return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({ success: true, booking: result.rows[0] });
} catch (error) {
    console.error("Error fetching booking details:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
}
};

/**
 * Complete payment for a booking.
 */
const completePayment = async (req, res) => {
const { bookingId } = req.params;
const { amount } = req.body;

if (!amount) {
    return res
    .status(400)
    .json({ success: false, message: "Amount is required." });
}

try {
    const query = `
    INSERT INTO Payment (Amount, Status, PaymentDate, BookingID)
    VALUES ($1, 'Completed', CURRENT_DATE, $2)
    RETURNING PaymentID;
    `;
    const result = await pool.query(query, [amount, bookingId]);

    res
    .status(201)
    .json({
        success: true,
        message: "Payment completed successfully.",
        paymentId: result.rows[0].paymentid,
    });
} catch (error) {
    console.error("Error completing payment:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
}
};

module.exports = {
createBooking,
updateBooking,
cancelBooking,
getBookingDetails,
completePayment,
};
