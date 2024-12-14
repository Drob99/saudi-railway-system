const express = require("express");
const { getAllCities } = require("../controllers/cityController");

const router = express.Router();

// Route to fetch all cities
router.get("/", getAllCities);

module.exports = router;
