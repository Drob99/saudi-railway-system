const pool = require("../db");

;

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
