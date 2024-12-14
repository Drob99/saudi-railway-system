const express = require("express");
const paymentController = require("../controllers/paymentController");
const router = express.Router();

// Routes for payment processing
router.get("/receipt/:bookingId", paymentController.getPaymentReceipt);

module.exports = router;
