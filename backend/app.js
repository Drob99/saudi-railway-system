const express = require('express');
const cors = require('cors'); // Import the cors package
const helmet = require('helmet');
const morgan = require('morgan'); 
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();


// Enable security headers
app.use(helmet());

// Enable CORS for all routes
app.use(cors());  // This allows all origins to access your API

// Middleware to parse JSON bodies
app.use(express.json());

// Add a middleware for logging requests
app.use(morgan('dev'));

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

// error handling for middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});


// Export the app
module.exports = app;

