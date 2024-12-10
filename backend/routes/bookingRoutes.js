const express = require("express");
const {
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingDetails,
  completePayment,
} = require("../controllers/bookingController");

const router = express.Router();

// Route to create a new booking
router.post("/create", createBooking);

// Route to update an existing booking
router.put("/update/:bookingId", updateBooking);

// Route to cancel a booking
router.delete("/cancel/:bookingId", cancelBooking);

// Route to get booking details
router.get("/:bookingId", getBookingDetails);

// Route to complete payment for a booking
router.post("/payment/:bookingId", completePayment);

module.exports = router;
