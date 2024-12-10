const express = require("express");
const router = express.Router();
const {
  assignStaffToTrain,
  promoteWaitlistedPassengers,
} = require("../controllers/adminController");

// Route to assign staff to a train
router.post("/assign-staff", assignStaffToTrain);

// Route to promote waitlisted passengers
router.post("/promote-waitlist", promoteWaitlistedPassengers);

module.exports = router;
