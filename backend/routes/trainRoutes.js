const express = require("express");
const { searchTrains } = require("../controllers/trainController");

const router = express.Router();

// Route to search for trains
router.get("/search", searchTrains);

module.exports = router;
