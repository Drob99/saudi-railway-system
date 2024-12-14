const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // Database connection
const { validationResult } = require("express-validator");
const Hasher = require("../utils/hasher");

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey"; // Replace with a secure key in production

// User Login Controller
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, accountType } = req.body; // Include accountType in input

  if (!["Passenger", "Staff"].includes(accountType)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid account type" });
  }

  try {
    // Check if user exists in the Person table
    const userQuery = "SELECT * FROM Person WHERE Email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Verify account type exists in the specific table
    const accountQuery =
      accountType === "Passenger"
        ? "SELECT * FROM Passenger WHERE PersonID = $1"
        : "SELECT * FROM Staff WHERE PersonID = $1";
    const accountResult = await pool.query(accountQuery, [user.personid]);

    if (accountResult.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Account type mismatch" });
    }

    // Verify password
    const isPasswordValid = await Hasher.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { personId: user.personid, email: user.email, role: accountType },
      JWT_SECRET,
      { expiresIn: "1Y" }
    );

    if (accountType !== "Passenger") user.hiredate = new Date();

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.registerPassenger = async (req, res) => {
  const {
    fname,
    lname,
    email,
    password,
    phone,
    identificationDoc,
    accountType,
  } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !password ||
    !identificationDoc ||
    !accountType
  ) {
    return res.status(400).json({
      success: false,
      error:
        "First name, last name, email, password, account type, and identification document are required.",
    });
  }

  if (accountType !== "Passenger") {
    return res.status(400).json({
      success: false,
      error:
        "Invalid account type. Only 'Passenger' is allowed for this route.",
    });
  }

  try {
    // Check if email already exists
    const emailQuery = "SELECT * FROM Person WHERE Email = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "Email is already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Person table
    const personQuery = `
      INSERT INTO Person (FName, LName, Email, Password, Phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING PersonID;
    `;
    const personValues = [fname, lname, email, hashedPassword, phone];
    const personResult = await pool.query(personQuery, personValues);
    const personId = personResult.rows[0].personid;

    // Insert into Passenger table
    const passengerQuery = `
      INSERT INTO Passenger (PersonID, IdentificationDoc)
      VALUES ($1, $2);
    `;
    await pool.query(passengerQuery, [personId, identificationDoc]);

    res.status(201).json({
      success: true,
      message: "Passenger registered successfully.",
    });
  } catch (error) {
    console.error("Error registering passenger:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};
exports.registerStaff = async (req, res) => {
  const { fname, lname, email, password, phone, accountType } = req.body;

  if (!fname || !lname || !email || !password || !accountType) {
    return res.status(400).json({
      success: false,
      error:
        "First name, last name, email, password, and account type are required.",
    });
  }

  if (accountType !== "Staff") {
    return res.status(400).json({
      success: false,
      error: "Invalid account type. Only 'Staff' is allowed for this route.",
    });
  }

  try {
    // Check if email already exists
    const emailQuery = "SELECT * FROM Person WHERE Email = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "Email is already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Person table
    const personQuery = `
      INSERT INTO Person (FName, LName, Email, Password, Phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING PersonID;
    `;
    const personValues = [fname, lname, email, hashedPassword, phone];
    const personResult = await pool.query(personQuery, personValues);
    const personId = personResult.rows[0].personid;

    // Insert into Staff table
    const staffQuery = `
      INSERT INTO Staff (PersonID, HireDate)
      VALUES ($1, CURRENT_DATE);
    `;
    await pool.query(staffQuery, [personId]);

    res.status(201).json({
      success: true,
      message: "Staff registered successfully.",
    });
  } catch (error) {
    console.error("Error registering staff:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};
