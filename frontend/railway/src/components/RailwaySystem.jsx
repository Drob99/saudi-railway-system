import React, { useState } from "react";
import trainLogo from "../images/trainLogo.png";

const RailwaySystem = () => {
  const trains = [
    {
      id: 1,
      number: "TR 101",
      date: "2025-05-14",
      source: "Mumbai",
      destination: "Delhi",
      seatsLeft: 100,
      price: 50,
    },
    {
      id: 2,
      number: "TR 202",
      date: "2025-04-04",
      source: "Chennai",
      destination: "Bangalore",
      seatsLeft: 75,
      price: 40,
    },
    {
      id: 3,
      number: "TR 303",
      date: "2025-03-20",
      source: "Kolkata",
      destination: "Pune",
      seatsLeft: 50,
      price: 60,
    },
  ];

  const [filters, setFilters] = useState({
    source: "",
    destination: "",
    date: "",
  });
  const [filteredTrains, setFilteredTrains] = useState(trains);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [formError, setFormError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const { source, destination, date } = filters;
    const result = trains.filter(
      (train) =>
        (!source || train.source.toLowerCase().includes(source.toLowerCase())) &&
        (!destination ||
          train.destination.toLowerCase().includes(destination.toLowerCase())) &&
        (!date || train.date === date)
    );
    setFilteredTrains(result);
  };

  const handleBookTicket = (train) => {
    setSelectedTrain(train);
  };

  const handleAddPassenger = () => {
    setPassengers([
      ...passengers,
      { firstName: "", lastName: "", iqamaID: "", seatNumber: "", contact: "" },
    ]);
  };

  const handleRemovePassenger = () => {
    if (passengers.length > 0) {
      setPassengers(passengers.slice(0, -1));
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const validateForm = () => {
    for (let passenger of passengers) {
      if (
        !passenger.firstName ||
        !passenger.lastName ||
        !passenger.iqamaID ||
        !passenger.seatNumber ||
        (!passenger.contact && !passenger.email)
      ) {
        setFormError("Please fill all mandatory fields.");
        return false;
      }
    }
    setFormError("");
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      alert("Booking confirmed!");
    }
  };

  if (selectedTrain) {
    const totalPrice = selectedTrain.price * passengers.length * 1.15;

    return (
      <div className="booking-form">
        <div className="left-section">
          <h1>{selectedTrain.number}</h1>
          <div className="button-container">
            <button onClick={handleRemovePassenger}>Remove Passenger</button>
            <button onClick={handleAddPassenger}>Add Passenger</button>
          </div>
          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-form">
              <input
                type="text"
                placeholder="First Name"
                value={passenger.firstName}
                onChange={(e) =>
                  handlePassengerChange(index, "firstName", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Last Name"
                value={passenger.lastName}
                onChange={(e) =>
                  handlePassengerChange(index, "lastName", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Iqama ID"
                value={passenger.iqamaID}
                onChange={(e) =>
                  handlePassengerChange(index, "iqamaID", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Seat Number"
                value={passenger.seatNumber}
                onChange={(e) =>
                  handlePassengerChange(index, "seatNumber", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Phone or Email"
                value={passenger.contact}
                onChange={(e) =>
                  handlePassengerChange(index, "contact", e.target.value)
                }
              />
            </div>
          ))}
          {formError && <p className="error">{formError}</p>}
        </div>
        <div className="right-section">
          <h2>Booking Summary</h2>
          <p>From: {selectedTrain.source}</p>
          <p>To: {selectedTrain.destination}</p>
          <p>Date: {selectedTrain.date}</p>
          <p>Passengers: {passengers.length}</p>
          <p>Price per ticket: ${selectedTrain.price}</p>
          <p>Total Price (15% VAT): ${totalPrice.toFixed(2)}</p>
          <button onClick={handleSubmit}>Book Ticket</button>
        </div>
      </div>
    );
  }

  return (
    <div className="railway-system">
      <h1>Railway System</h1>
      <div className="search-form">
        <input
          type="text"
          name="source"
          placeholder="Source City"
          value={filters.source}
          onChange={handleInputChange}
          className="search-input"
        />
        <input
          type="text"
          name="destination"
          placeholder="Destination City"
          value={filters.destination}
          onChange={handleInputChange}
          className="search-input"
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleInputChange}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <div className="train-cards">
        {filteredTrains.length > 0 ? (
          filteredTrains.map((train) => (
            <div key={train.id} className="train-card">
              <div className="train-card-header">
                <img
                  src={trainLogo}
                  alt="Train Logo"
                  className="train-logo"
                />
                <span className="train-number">{train.number}</span>
                <span className="train-date">{train.date}</span>
              </div>
              <div className="train-card-body">
                <p className="train-route">
                  From {train.source} to {train.destination}
                </p>
                <div className="train-info">
                  <span className="train-seats">
                    Seats Left: {train.seatsLeft}
                  </span>
                  <span className="train-price">Price: ${train.price}</span>
                </div>
              </div>
              <button
                onClick={() => handleBookTicket(train)}
                className="book-button"
              >
                Book Ticket
              </button>
            </div>
          ))
        ) : (
          <p>No trains found. Please adjust your filters.</p>
        )}
      </div>
    </div>
  );
};

export default RailwaySystem;
