const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // Database connection
const { validationResult } = require("express-validator");

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey"; // Replace with a secure key in production

// User Login Controller
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists
        const userQuery = "SELECT * FROM Person WHERE Email = $1";
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
        return res
            .status(401)
            .json({ success: false, error: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
        return res
            .status(401)
            .json({ success: false, error: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
        { personId: user.personid, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
        );

        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
    };

    // User Registration Controller
    exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fname, lname, email, password, role, phone } = req.body;

    try {
        // Check if email already exists
        const emailQuery = "SELECT * FROM Person WHERE Email = $1";
        const emailResult = await pool.query(emailQuery, [email]);

        if (emailResult.rows.length > 0) {
        return res
            .status(400)
            .json({ success: false, error: "Email is already registered" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the Person table
        const personQuery = `
        INSERT INTO Person (FName, LName, Email, Password, Phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING PersonID;
        `;
        const personValues = [fname, lname, email, hashedPassword, phone];
        const personResult = await pool.query(personQuery, personValues);
        const personId = personResult.rows[0].personid;

        // Insert into Passenger or Staff based on role
        if (role === "Passenger") {
        const passengerQuery = `
            INSERT INTO Passenger (PersonID, IdentificationDoc)
            VALUES ($1, $2);
        `;
        await pool.query(passengerQuery, [personId, "N/A"]);
        } else {
        const staffQuery = `
            INSERT INTO Staff (PersonID, Roles, HireDate)
            VALUES ($1, $2, CURRENT_DATE);
        `;
        await pool.query(staffQuery, [personId, role]);
        }

        res
        .status(201)
        .json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
