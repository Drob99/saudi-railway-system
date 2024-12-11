const reportRoutes = require("express").Router();
const {
  getActiveTrains,
  getTrainStations,
  getPassengerReservations,
  getWaitlistedLoyaltyPassengers,
  getAverageLoadFactor,
  getDependentsTravelingOnDate,
} = require("../controllers/reportController");

// Define the routes and associate them with the controller methods
reportRoutes.get("/active-trains", getActiveTrains);
reportRoutes.get("/train-stations", getTrainStations);
reportRoutes.get("/passenger-reservations", getPassengerReservations);
reportRoutes.get(
  "/waitlisted-loyalty-passengers",
  getWaitlistedLoyaltyPassengers
);
reportRoutes.get("/average-load-factor", getAverageLoadFactor);
reportRoutes.get("/dependents-traveling", getDependentsTravelingOnDate);

module.exports = reportRoutes;
