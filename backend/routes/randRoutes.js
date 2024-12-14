const express = require("express");
const router = express.Router();
const {
    getSeatAvailability,
    getPassengerAndDependents,
    getAllPassengers,
    getAllReservations
} = require("../controllers/randController");

router.get("/getSeatAvailability", getSeatAvailability);

// Define the route for fetching passenger and dependents
router.get("/getPassengerAndDependents/:passengerId", getPassengerAndDependents);

router.get("/getAllPassengers", getAllPassengers);

router.get("/getAllReservations", getAllReservations);

module.exports = router;
