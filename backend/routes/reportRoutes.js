const express = require("express");
const reportController = require("../controllers/reportController");

const router = express.Router();

// 1. Current active trains that are on their way today (for all users)
router.get("/active-trains", reportController.getActiveTrainsToday);

// 2. List stations for each train (for admins)
router.get("/stations/:trainId", reportController.getStationsForTrain);

// 3. Reservation details given passenger ID (for passengers)
router.get(
  "/reservations/:passengerId",
  reportController.getReservationDetails
);

// 4. Waitlisted loyalty passengers in each class given a train number (for admins)
router.get(
  "/waitlisted-loyalty/:trainId",
  reportController.getWaitlistedLoyaltyPassengers
);

// 5. Average load factor for each train on a given date (for admins)
router.get("/load-factor", reportController.getAverageLoadFactor);

// 6. List of dependents travelling on a given date in all trains (for admins)
router.get("/dependents", reportController.getDependentsOnDate);

module.exports = router;
