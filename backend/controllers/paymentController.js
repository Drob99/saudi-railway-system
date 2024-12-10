const pool = require("../db");

// Complete a payment
exports.completePayment = async (req, res) => {
const { bookingId, amount } = req.body;

if (!bookingId || !amount) {
return res
    .status(400)
    .json({ success: false, error: "Booking ID and amount are required" });
}

try {
// Check if the booking exists
const bookingQuery = "SELECT * FROM Booking WHERE BookingID = $1";
const bookingResult = await pool.query(bookingQuery, [bookingId]);

if (bookingResult.rows.length === 0) {
    return res
    .status(404)
    .json({ success: false, error: "Booking not found" });
}

// Insert payment details
const paymentQuery = `
    INSERT INTO Payment (Amount, Status, PaymentDate, BookingID)
    VALUES ($1, $2, CURRENT_DATE, $3)
    RETURNING PaymentID;
`;
const paymentResult = await pool.query(paymentQuery, [
    amount,
    "Completed",
    bookingId,
]);

// Update booking status to 'Confirmed'
const updateBookingQuery =
    "UPDATE Booking SET Status = $1 WHERE BookingID = $2";
await pool.query(updateBookingQuery, ["Confirmed", bookingId]);

res
    .status(201)
    .json({ success: true, paymentId: paymentResult.rows[0].paymentid });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};

// Get payment receipt
exports.getPaymentReceipt = async (req, res) => {
const { bookingId } = req.params;

try {
const query = `
    SELECT p.PaymentID, p.Amount, p.Status, p.PaymentDate, 
            b.BookingID, b.Class, b.Date, t.DepartureTime, t.ArrivalTime, 
            tr.Name_English AS TrainName
    FROM Payment p
    JOIN Booking b ON p.BookingID = b.BookingID
    JOIN Trip t ON b.TripID = t.TripID
    JOIN Train tr ON t.TrainID = tr.TrainID
    WHERE p.BookingID = $1;
`;
const result = await pool.query(query, [bookingId]);

if (result.rows.length === 0) {
    return res
    .status(404)
    .json({ success: false, error: "Payment receipt not found" });
}

res.status(200).json({ success: true, data: result.rows[0] });
} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: "Internal server error" });
}
};
