const express = require('express');
const cors = require('cors'); // Import the cors package
const helmet = require('helmet');
const morgan = require('morgan'); 
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const tripRoutes = require('./routes/tripRoutes');
const reportRoutes = require("./routes/reportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const trainRoutes = require("./routes/trainRoutes");

const app = express();

<<<<<<< HEAD
=======

>>>>>>> main
// Enable security headers
app.use(helmet());

// ! Enable CORS with specific configuration
// const corsOptions = {
//   origin: 'http://your-frontend-domain.com', // Replace with your frontend's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
// };
// app.use(cors(corsOptions));

// Enable CORS for all routes
app.use(cors());  // This allows all origins to access your API

// Middleware to parse JSON bodies
app.use(express.json());

// Add logging middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Register your routes
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/booking', bookingRoutes);
app.use('/passenger', passengerRoutes);
app.use('/trip', tripRoutes);
app.use("/reports", reportRoutes);
app.use("/payments", paymentRoutes);
app.use("/trains", trainRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});


// Export the app
module.exports = app;

