const express = require('express');
const router = express.Router();

// Example admin route
router.get('/', (req, res) => {
  res.send('Admin Dashboard');
});

// Example route to fetch all users (just an example)
router.get('/users', (req, res) => {
  res.send('List of users');
});

// Example route to create a new admin
router.post('/create-admin', (req, res) => {
  const { username, password } = req.body;
  // Here you can insert logic to create a new admin
  res.send(`Admin created with username: ${username}`);
});

// Export the router
module.exports = router;
