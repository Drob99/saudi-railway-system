const express = require('express');
const cors = require('cors'); // Import the cors package
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());  // This allows all origins to access your API

// Middleware to parse JSON bodies
app.use(express.json());

// Register your routes
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/booking', bookingRoutes);
app.use('/passenger', passengerRoutes);
app.use('/trip', tripRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// Export the app
module.exports = app;

