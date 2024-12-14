const express = require("express");
const {
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingDetails,
  completePayment,
  createReservationForStaff,
  createBookingForPassenger,
} = require("../controllers/bookingController");
const roleRestricted = require("../middleware/role_restricted");

const router = express.Router();

// Route to create a new booking
router.post("/create", createReservationForStaff);

// Route to create a booking for passenger
router.post("/create-passenger", createBookingForPassenger);

// Route to update an existing booking
router.put("/update/:bookingId", roleRestricted(["Staff"]), updateBooking);

// Route to cancel a booking
router.delete("/cancel/:bookingId", roleRestricted(["Staff"]), cancelBooking);

// Route to get booking details
router.get("/:bookingId", getBookingDetails);

// Route to complete payment for a booking
router.post("/payment/:paymentId", completePayment);

module.exports = router;
