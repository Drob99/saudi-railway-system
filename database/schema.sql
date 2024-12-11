-- City Table
CREATE TABLE City (
    CityID SERIAL,
    Name VARCHAR(100) NOT NULL,
    Region VARCHAR(100) NOT NULL,
    PRIMARY KEY (CityID),
    UNIQUE (Name)
);

-- Station Table
CREATE TABLE Station (
    StationID SERIAL,
    Name VARCHAR(100) NOT NULL,
    CityID INT NOT NULL,
    PRIMARY KEY (StationID),
    FOREIGN KEY (CityID) REFERENCES City(CityID)
);

-- Track Table
CREATE TABLE Track (
    TrackID INT NOT NULL UNIQUE,
    OriginStationID INT NOT NULL,
    DestinationStationID INT NOT NULL,
    PRIMARY KEY (TrackID, OriginStationID, DestinationStationID),
    FOREIGN KEY (OriginStationID) REFERENCES Station(StationID),
    FOREIGN KEY (DestinationStationID) REFERENCES Station(StationID)
);

-- Train Table
CREATE TABLE Train (
    TrainID SERIAL,
    Name_English VARCHAR(100) NOT NULL,
    Name_Arabic VARCHAR(100) NOT NULL,
    Capacity_Economy INT NOT NULL,
    Capacity_Business INT NOT NULL,
    PRIMARY KEY(TrainID)
);

-- Trip Table
CREATE TABLE Trip (
    TripID INT NOT NULL UNIQUE, -- Partial key
    TrainID INT NOT NULL, -- Parent foreign key
    TrackID INT NOT NULL, -- Parent foreign key
    OriginStationID INT NOT NULL,
    DestinationStationID INT NOT NULL,
    DepartureTime TIMESTAMP NOT NULL,
    ArrivalTime TIMESTAMP NOT NULL,
    SequenceNumber INT NOT NULL,
    Active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (TripID, TrainID, TrackID, OriginStationID, DestinationStationID), -- Composite primary key
    FOREIGN KEY (TrainID) REFERENCES Train(TrainID),
    FOREIGN KEY (TrackID, OriginStationID, DestinationStationID) REFERENCES Track(TrackID, OriginStationID, DestinationStationID)
);



-- Person Table
CREATE TABLE Person (
    PersonID SERIAL,
    FName VARCHAR(100) NOT NULL,
    MInit CHAR(1),
    LName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL, -- Added to store hashed passwords
    Phone VARCHAR(15),
    Password VARCHAR(255) NOT NULL, -- Added to store hashed password
    PRIMARY KEY(PersonID)
);

-- Passenger Table
CREATE TABLE Passenger (
    PersonID INT,
    IdentificationDoc VARCHAR(255) NOT NULL,
    LoyaltyKilometers INT DEFAULT 0,
    PRIMARY KEY(PersonID),
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID)
);

-- Staff Table
CREATE TABLE Staff (
    PersonID INT,
    Roles VARCHAR(100) NOT NULL,
    HireDate DATE NOT NULL,
    PRIMARY KEY(PersonID),
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID)
);

-- Booking Table
CREATE TABLE Booking (
    BookingID SERIAL PRIMARY KEY,
    Class VARCHAR(10) NOT NULL CHECK (Class IN ('Economy', 'Business')), -- ENUM-like behavior using CHECK
    Status VARCHAR(15) NOT NULL CHECK (Status IN ('Confirmed', 'Cancelled', 'Waiting')),
    Date DATE NOT NULL,
    BaseFare DECIMAL(10, 2) NOT NULL,
    NumOfLuggage INT DEFAULT 0,
    SeatNumber INT NOT NULL,
    NumOfPassengers INT DEFAULT 1,
    TripID INT NOT NULL,
    TrainID INT NOT NULL,
    TrackID INT NOT NULL,
    OriginStationID INT NOT NULL,
    DestinationStationID INT NOT NULL,
    PassengerID INT NOT NULL,
    StaffID INT,
    FOREIGN KEY (TripID, TrainID, TrackID, OriginStationID, DestinationStationID) REFERENCES Trip(TripID, TrainID, TrackID, OriginStationID, DestinationStationID),
    FOREIGN KEY (PassengerID) REFERENCES Passenger(PersonID),
    FOREIGN KEY (StaffID) REFERENCES Staff(PersonID)
);

-- Dependent Table
CREATE TABLE Dependent (
    DepID INT NOT NULL UNIQUE, -- Partial key
    PersonID INT NOT NULL, -- Parent foreign key
    Name VARCHAR(100) NOT NULL,
    Relationship VARCHAR(50),
    PRIMARY KEY (DepID, PersonID), -- Composite primary key
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID)
);


-- WaitingList Table
CREATE TABLE WaitingList (
    WaitingID SERIAL PRIMARY KEY,
    TravelDate DATE NOT NULL,
    Status VARCHAR(15) NOT NULL CHECK (Status IN ('Pending', 'Confirmed')),
    ReservationDate DATE NOT NULL,
    BookingID INT NOT NULL,
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);

-- Payment Table
CREATE TABLE Payment (
    PaymentID SERIAL PRIMARY KEY,
    Amount NUMERIC(10, 2) NOT NULL,
    Status VARCHAR(15) NOT NULL CHECK (Status IN ('Pending', 'Completed')),
    PaymentDate DATE NOT NULL,
    BookingID INT NOT NULL,
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);
