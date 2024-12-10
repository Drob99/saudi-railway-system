const express = require('express');
const router = express.Router();

// Example login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Authentication logic here
  res.send(`Logged in with username: ${username}`);
});

// Example register route
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  // Registration logic here
  res.send(`Registered with username: ${username}`);
});

// Export the router
module.exports = router;
