const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Middleware for admin authentication
const adminAuthMiddleware = (req, res, next) => {
  const isAdmin = true; // Replace with actual admin authentication logic
  if (!isAdmin) {
    return res.status(403).send({ error: 'Forbidden: Admin access only' });
  }
  next();
};

router.use(adminAuthMiddleware); // Protect all admin routes
// Admin dashboard route
router.get('/', (req, res) => {
  res.status(200).send({ success: true, message: 'Admin Dashboard' });
});

// Fetch all users
router.get('/users', (req, res) => {
  const users = []; // Replace with logic to fetch users
  res.status(200).send({ success: true, message: 'List of users', data: users });
});

// Create a new admin
router.post(
  '/create-admin',
  [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    // Replace with logic to create admin
    res.status(201).send({ success: true, message: `Admin created with username: ${username}` });
  }
);
// Export the router
module.exports = router;
