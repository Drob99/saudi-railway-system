const express = require("express");
const cors = require("cors"); // Import the cors package
const helmet = require("helmet");
const morgan = require("morgan");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const tripRoutes = require("./routes/tripRoutes");
const reportRoutes = require("./routes/reportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const trainRoutes = require("./routes/trainRoutes");
const protectedRoute = require("./middleware/protected");
const cityRoutes = require("./routes/cityRoutes");
const randRoutes = require("./routes/randRoutes");
const pool = require("./db");

const app = express();

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
app.use(cors()); // This allows all origins to access your API

// Middleware to parse JSON bodies
app.use(express.json());

// Add logging middleware for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
pool.query(`-- Insert Cities
INSERT INTO City (Name, Region) VALUES
('Riyadh', 'Central'),
('Jeddah', 'Western'),
('Dammam', 'Eastern'),
('Makkah', 'Western'),
('Medina', 'Western'),
('Hail', 'Northern'),
('N_Riyadh', 'Central'),
('N_Riyadh', 'Central'),
('F_Jeddah', 'Western'),
('R_Jeddah', 'Western'),
('D_Jeddah', 'Western'),
('W_Jeddah', 'Western'),
('Q_Jeddah', 'Western'),
('O_Jeddah', 'Western'),
('P_Jeddah', 'Western'),
('N_Jeddah', 'Western'),
('F_Dammam', 'Eastern'),
('R_Dammam', 'Eastern'),
('D_Dammam', 'Eastern'),
('W_Dammam', 'Eastern'),
('Q_Dammam', 'Eastern'),
('O_Dammam', 'Eastern'),
('P_Dammam', 'Eastern'),
('N_Dammam', 'Eastern'),
('F_Makkah', 'Western'),
('R_Makkah', 'Western'),
('D_Makkah', 'Western'),
('W_Makkah', 'Western'),
('Q_Makkah', 'Western'),
('O_Makkah', 'Western'),
('P_Makkah', 'Western'),
('N_Makkah', 'Western'),
('F_Medina', 'Western'),
('R_Medina', 'Western'),
('D_Medina', 'Western'),
('W_Medina', 'Western'),
('Q_Medina', 'Western'),
('O_Medina', 'Western'),
('P_Medina', 'Western'),
('N_Medina', 'Western'),
('F_Hail', 'Northern'),
('R_Hail', 'Northern'),
('D_Hail', 'Northern'),
('W_Hail', 'Northern'),
('Q_Hail', 'Northern'),
('O_Hail', 'Northern'),
('P_Hail', 'Northern'),
('N_Hail', 'Northern'),
('Fabuk', 'Northern');
('Rabuk', 'Northern');
('Dabuk', 'Northern');
('Wabuk', 'Northern');
('Qabuk', 'Northern');
('Oabuk', 'Northern');
('Pabuk', 'Northern');

-- Insert Stations
INSERT INTO Station (Name, CityID) VALUES
('Riyadh Station', 1),
('O_Riyadh Station', 1),
('S_Riyadh Station', 1),
('W_Riyadh Station', 1),
('E_Riyadh Station', 1),
('T_Riyadh Station', 1),
('Jeddah Station', 2),
('O_Jeddah Station', 2),
('S_Jeddah Station', 2),
('W_Jeddah Station', 2),
('E_Jeddah Station', 2),
('T_Jeddah Station', 2),
('Dammam Station', 3),
('O_Dammam Station', 3),
('S_Dammam Station', 3),
('W_Dammam Station', 3),
('E_Dammam Station', 3),
('T_Dammam Station', 3),
('Makkah Station', 4),
('O_Makkah Station', 4),
('S_Makkah Station', 4),
('W_Makkah Station', 4),
('E_Makkah Station', 4),
('T_Makkah Station', 4),
('Medina Station', 5),
('O_Medina Station', 5),
('S_Medina Station', 5),
('W_Medina Station', 5),
('E_Medina Station', 5),
('T_Medina Station', 5),
('Hail Station', 6),
('O_Hail Station', 6),
('S_Hail Station', 6),
('W_Hail Station', 6),
('E_Hail Station', 6),
('T_Hail Station', 6),
('Tabuk Station', 7);

-- Insert Tracks
INSERT INTO Track (TrackID, OriginStationID, DestinationStationID) VALUES
(1, 1, 2), -- Riyadh to Jeddah
(1, 1, 2), -- Riyadh to Jeddah
(1, 1, 2), -- Riyadh to Jeddah
(1, 1, 2), -- Riyadh to Jeddah
(1, 1, 2), -- Riyadh to Jeddah
(1, 1, 2), -- Riyadh to Jeddah
(1, 1, 2), -- Riyadh to Jeddah
(2, 2, 4), -- Jeddah to Makkah
(2, 2, 4), -- Jeddah to Makkah
(2, 2, 4), -- Jeddah to Makkah
(2, 2, 4), -- Jeddah to Makkah
(2, 2, 4), -- Jeddah to Makkah
(2, 2, 4), -- Jeddah to Makkah
(2, 2, 4), -- Jeddah to Makkah
(3, 4, 5), -- Makkah to Medina
(3, 4, 5), -- Makkah to Medina
(3, 4, 5), -- Makkah to Medina
(3, 4, 5), -- Makkah to Medina
(3, 4, 5), -- Makkah to Medina
(3, 4, 5), -- Makkah to Medina
(3, 4, 5), -- Makkah to Medina
(4, 1, 3), -- Riyadh to Dammam
(4, 1, 3), -- Riyadh to Dammam
(4, 1, 3), -- Riyadh to Dammam
(4, 1, 3), -- Riyadh to Dammam
(4, 1, 3), -- Riyadh to Dammam
(4, 1, 3), -- Riyadh to Dammam
(4, 1, 3), -- Riyadh to Dammam
(5, 3, 5), -- Dammam to Medina
(5, 3, 5), -- Dammam to Medina
(5, 3, 5), -- Dammam to Medina
(5, 3, 5), -- Dammam to Medina
(5, 3, 5), -- Dammam to Medina
(5, 3, 5), -- Dammam to Medina
(5, 3, 5), -- Dammam to Medina
(6, 1, 6), -- Riyadh to Hail
(6, 1, 6), -- Riyadh to Hail
(6, 1, 6), -- Riyadh to Hail
(6, 1, 6), -- Riyadh to Hail
(6, 1, 6), -- Riyadh to Hail
(6, 1, 6), -- Riyadh to Hail
(6, 1, 6), -- Riyadh to Hail
(7, 6, 7); -- Hail to Tabuk

-- Insert Trains
INSERT INTO Train (Name_English, Name_Arabic, Capacity_Economy, Capacity_Business) VALUES
('HHR100', 'قطار الحرمين السريع', 400, 50),
('SAR200', 'قطار الشمال', 300, 100),
('SAR300', 'قطار الجنوب', 350, 75),
('SAR400', 'قطار الشرق', 500, 150);

-- Insert Trips
INSERT INTO Trip (TripID, TrainID, TrackID, OriginStationID, DestinationStationID, DepartureTime, ArrivalTime, SequenceNumber, Active) VALUES
(1, 1, 1, 1, 2, '2024-12-20 08:00:00', '2024-12-10 12:00:00', 1, TRUE), -- Riyadh to Jeddah
(1, 1, 1, 1, 2, '2024-12-20 08:30:00', '2024-12-10 12:00:00', 1, TRUE), -- Riyadh to Jeddah
(1, 1, 1, 1, 2, '2024-12-20 08:40:00', '2024-12-10 12:00:00', 1, TRUE), -- Riyadh to Jeddah
(1, 1, 1, 1, 2, '2024-12-20 08:50:00', '2024-12-10 12:00:00', 1, TRUE), -- Riyadh to Jeddah
(2, 1, 2, 2, 4, '2024-12-20 14:00:00', '2024-12-10 16:00:00', 2, TRUE), -- Jeddah to Makkah
(2, 1, 2, 2, 4, '2024-12-20 14:30:00', '2024-12-10 16:00:00', 2, TRUE), -- Jeddah to Makkah
(2, 1, 2, 2, 4, '2024-12-20 14:40:00', '2024-12-10 16:00:00', 2, TRUE), -- Jeddah to Makkah
(2, 1, 2, 2, 4, '2024-12-20 14:50:00', '2024-12-10 16:00:00', 2, TRUE), -- Jeddah to Makkah
(3, 1, 3, 4, 5, '2024-12-20 17:00:00', '2024-12-10 18:00:00', 3, TRUE), -- Makkah to Medina
(3, 1, 3, 4, 5, '2024-12-20 17:30:00', '2024-12-10 18:00:00', 3, TRUE), -- Makkah to Medina
(3, 1, 3, 4, 5, '2024-12-20 17:40:00', '2024-12-10 18:00:00', 3, TRUE), -- Makkah to Medina
(3, 1, 3, 4, 5, '2024-12-20 17:50:00', '2024-12-10 18:00:00', 3, TRUE), -- Makkah to Medina
(4, 2, 4, 1, 3, '2024-12-25 08:00:00', '2024-12-11 12:00:00', 1, TRUE), -- Riyadh to Dammam
(4, 2, 4, 1, 3, '2024-12-25 08:30:00', '2024-12-11 12:00:00', 1, TRUE), -- Riyadh to Dammam
(4, 2, 4, 1, 3, '2024-12-25 08:40:00', '2024-12-11 12:00:00', 1, TRUE), -- Riyadh to Dammam
(4, 2, 4, 1, 3, '2024-12-25 08:50:00', '2024-12-11 12:00:00', 1, TRUE), -- Riyadh to Dammam
(5, 3, 6, 1, 6, '2024-12-26 07:00:00', '2024-12-12 12:00:00', 1, TRUE), -- Riyadh to Hail
(5, 3, 6, 1, 6, '2024-12-26 07:30:00', '2024-12-12 12:00:00', 1, TRUE), -- Riyadh to Hail
(5, 3, 6, 1, 6, '2024-12-26 07:40:00', '2024-12-12 12:00:00', 1, TRUE), -- Riyadh to Hail
(5, 3, 6, 1, 6, '2024-12-26 07:50:00', '2024-12-12 12:00:00', 1, TRUE), -- Riyadh to Hail
(6, 3, 7, 6, 7, '2024-12-13 10:00:00', '2024-12-13 15:00:00', 2, TRUE); -- Hail to Tabuk

-- Insert Persons
INSERT INTO Person (FName, MInit, LName, Email, Password, Phone) VALUES
('Ahmed', 'M', 'Al-Farhan', 'ahmed@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0551234567'),
('Ahmed', 'M', 'Al-Farhan', 'ahmed@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0552234567'),
('Sarah', 'A', 'Al-Zahrani', 'sarah@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0509876543'),
('Sarah', 'A', 'Al-Zahrani', 'sarah@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0502276543'),
('Khalid', 'R', 'Al-Otaibi', 'khalid@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0548765432'),
('Khalid', 'R', 'Al-Otaibi', 'khalid@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0542265432'),
('Noura', 'B', 'Al-Shehri', 'noura@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO','0531237894'),
('Noura', 'B', 'Al-Shehri', 'noura@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO','0532237894'),
('Ali', 'H', 'Al-Qahtani', 'ali@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0566543210'),
('Ali', 'H', 'Al-Qahtani', 'ali@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0562243210'),
('Layla', 'A', 'Al-Harbi', 'layla@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0571122334'),
('Layla', 'A', 'Al-Harbi', 'layla@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0572222334'),
('Mansour', 'F', 'Al-Juhani', 'mansour@example.com', '$2y$10$O5xwbXQByeEvDgI7fbwOJ.1RkDs6fn5vC4aay3KiPWMnpMTrnkNAO', '0589988776');

-- Insert Passengers
INSERT INTO Passenger (PersonID, IdentificationDoc, LoyaltyKilometers) VALUES
(1, '123456789', 120),
(1, '123456789', 120),
(2, '987654321', 250),
(2, '987654321', 250),
(3, '112233445', 350),
(3, '112233445', 350),
(4, '556677889', 100),
(4, '556677889', 100),
(5, '998877665', 50);

-- Insert Staff
INSERT INTO Staff (PersonID, Roles, HireDate) VALUES
(6, 'Conductor', '2022-01-15'),
(7, 'Manager', '2021-05-10');

-- Insert Bookings
INSERT INTO Booking (Class, Status, Date, BaseFare, NumOfLuggage, SeatNumber, NumOfPassengers, TripID, TrainID, TrackID, OriginStationID, DestinationStationID, PassengerID, StaffID) VALUES
('Economy', 'Confirmed', '2024-12-01', 200.00, 1, 15, 1, 1, 1, 1, 1, 2, 1, 6), -- Riyadh to Jeddah trip for Passenger 1, Staff 6
('Business', 'Cancelled', '2024-12-02', 500.00, 2, 5, 1, 2, 1, 2, 2, 4, 2, 7), -- Jeddah to Makkah trip for Passenger 2, Staff 7
('Economy', 'Waiting', '2024-12-03', 150.00, 0, 20, 1, 3, 1, 3, 4, 5, 3, NULL), -- Makkah to Medina trip for Passenger 3, no staff assigned
('Business', 'Confirmed', '2024-12-04', 300.00, 3, 2, 1, 4, 2, 4, 1, 3, 4, 6), -- Riyadh to Dammam trip for Passenger 4, Staff 6
('Economy', 'Confirmed', '2024-12-05', 250.00, 1, 10, 1, 5, 3, 6, 1, 6, 5, 7); -- Riyadh to Hail trip for Passenger 5, Staff 7



-- Insert Dependents
INSERT INTO Dependent (DepID, PersonID, Name, Relationship) VALUES
(1, 1, 'Ali', 'Son'), -- Dependent for Ahmed
(2, 1, 'Amina', 'Daughter'), -- Another dependent for Ahmed
(3, 2, 'Fatima', 'Wife'), -- Dependent for Sarah
(4, 3, 'Omar', 'Son'); -- Dependent for Khalid

-- Insert Waiting List Entries
INSERT INTO WaitingList (WaitingID, TravelDate, Status, ReservationDate, BookingID) VALUES
(1, '2024-12-10', 'Pending', '2024-12-05', 1),
(2, '2024-12-11', 'Confirmed', '2024-12-06', 2),
(3, '2024-12-12', 'Pending', '2024-12-07', 3);

-- Insert Payments
INSERT INTO Payment (PaymentID, Amount, Status, PaymentDate, BookingID) VALUES
(1, 200.00, 'Completed', '2024-12-01', 1),
(2, 500.00, 'Completed', '2024-12-02', 2),
(3, 150.00, 'Pending', '2024-12-03', 3);
`)
// Register your routes
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/passenger", passengerRoutes);
app.use("/api/v1/trip", tripRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/trains", trainRoutes);
app.use("/api/v1/cities", cityRoutes);
app.use("/api/v1/rand", randRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Export the app
module.exports = app;
