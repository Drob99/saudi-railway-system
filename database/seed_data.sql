-- Insert Cities
INSERT INTO City (Name, Region) VALUES
('Riyadh', 'Central'),
('Jeddah', 'Western'),
('Dammam', 'Eastern'),
('Makkah', 'Western'),
('Medina', 'Western'),
('Hail', 'Northern'),
('Tabuk', 'Northern');

-- Insert Stations
INSERT INTO Station (Name, CityID) VALUES
('Riyadh Station', 1),
('Jeddah Station', 2),
('Dammam Station', 3),
('Makkah Station', 4),
('Medina Station', 5),
('Hail Station', 6),
('Tabuk Station', 7);

-- Insert Tracks
INSERT INTO Track (TrackID, OriginStationID, DestinationStationID) VALUES
(1, 1, 2), -- Riyadh to Jeddah
(2, 2, 4), -- Jeddah to Makkah
(3, 4, 5), -- Makkah to Medina
(4, 1, 3), -- Riyadh to Dammam
(5, 3, 5), -- Dammam to Medina
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
(1, 1, 1, 1, 2, '2024-12-10 08:00:00', '2024-12-10 12:00:00', 1, TRUE), -- Riyadh to Jeddah
(2, 1, 2, 2, 4, '2024-12-10 14:00:00', '2024-12-10 16:00:00', 2, TRUE), -- Jeddah to Makkah
(3, 1, 3, 4, 5, '2024-12-10 17:00:00', '2024-12-10 18:00:00', 3, TRUE), -- Makkah to Medina
(4, 2, 4, 1, 3, '2024-12-11 08:00:00', '2024-12-11 12:00:00', 1, TRUE), -- Riyadh to Dammam
(5, 3, 6, 1, 6, '2024-12-12 07:00:00', '2024-12-12 12:00:00', 1, TRUE), -- Riyadh to Hail
(6, 3, 7, 6, 7, '2024-12-13 10:00:00', '2024-12-13 15:00:00', 2, TRUE); -- Hail to Tabuk

-- Insert Persons
INSERT INTO Person (FName, MInit, LName, Email, Phone) VALUES
('Ahmed', 'M', 'Al-Farhan', 'ahmed@example.com', '0551234567'),
('Sarah', 'A', 'Al-Zahrani', 'sarah@example.com', '0509876543'),
('Khalid', 'R', 'Al-Otaibi', 'khalid@example.com', '0548765432'),
('Noura', 'B', 'Al-Shehri', 'noura@example.com', '0531237894'),
('Ali', 'H', 'Al-Qahtani', 'ali@example.com', '0566543210'),
('Layla', 'A', 'Al-Harbi', 'layla@example.com', '0571122334'),
('Mansour', 'F', 'Al-Juhani', 'mansour@example.com', '0589988776');

-- Insert Passengers
INSERT INTO Passenger (PersonID, IdentificationDoc, LoyaltyKilometers) VALUES
(1, '123456789', 120),
(2, '987654321', 250),
(3, '112233445', 350),
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
