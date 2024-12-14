const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

// User login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// Register a Passenger
router.post(
  "/register/passenger",
  [
    body("fname").notEmpty().withMessage("First name is required"),
    body("lname").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("accountType")
      .equals("Passenger")
      .withMessage("Account type must be 'Passenger'"),
    body("identificationDoc")
      .notEmpty()
      .withMessage("Identification document is required"),
  ],
  authController.registerPassenger
);

// Register a Staff
router.post(
  "/register/staff",
  [
    body("fname").notEmpty().withMessage("First name is required"),
    body("lname").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("accountType")
      .equals("Staff")
      .withMessage("Account type must be 'Staff'"),
  ],
  authController.registerStaff
);

module.exports = router;