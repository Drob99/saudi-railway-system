import React, { useState } from "react";
import trainLogo from "../images/trainLogo.png";

const RailwaySystem = () => {
  const trains = [
    {
      trainid: 1,
      name_english: "TR 101",
      departuretime: "2025-05-14",
      originCityName: "Mumbai",
      destinationCityName: "Delhi",
      capacity_economy: 100,
      capacity_econobusiness: 50,
      price: 50,
    },
    {
      trainid: 2,
      name_english: "TR 202",
      departuretime: "2025-04-04",
      originCityName: "Chennai",
      destinationCityName: "Bangalore",
      capacity_economy: 75,
      capacity_econobusiness: 30,
      price: 40,
    },
    {
      trainid: 3,
      name_english: "TR 303",
      departuretime: "2025-03-20",
      originCityName: "Kolkata",
      destinationCityName: "Pune",
      capacity_economy: 50,
      capacity_econobusiness: 20,
      price: 60,
    },
  ];

  const [filters, setFilters] = useState({
    originCityName: "",
    destinationCityName: "",
    departuretime: "",
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
    const { originCityName, destinationCityName, departuretime } = filters;
    const result = trains.filter(
      (train) =>
        (!originCityName ||
          train.originCityName
            .toLowerCase()
            .includes(originCityName.toLowerCase())) &&
        (!destinationCityName ||
          train.destinationCityName
            .toLowerCase()
            .includes(destinationCityName.toLowerCase())) &&
        (!departuretime || train.departuretime === departuretime)
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
          <h1>{selectedTrain.name_english}</h1>
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
          <p>From: {selectedTrain.originCityName}</p>
          <p>To: {selectedTrain.destinationCityName}</p>
          <p>Date: {selectedTrain.departuretime}</p>
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
      <h1 className="railway-system-title">Home page</h1>
      <div className="search-form">
        <input
          type="text"
          name="originCityName"
          placeholder="Source City"
          value={filters.originCityName}
          onChange={handleInputChange}
          className="search-input"
        />
        <input
          type="text"
          name="destinationCityName"
          placeholder="Destination City"
          value={filters.destinationCityName}
          onChange={handleInputChange}
          className="search-input"
        />
        <input
          type="date"
          name="departuretime"
          value={filters.departuretime}
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
            <div key={train.trainid} className="train-card">
              <div className="train-card-header">
                <img
                  src={trainLogo}
                  alt="Train Logo"
                  className="train-logo"
                />
                <span className="train-number">{train.name_english}</span>
                <span className="train-date">{train.departuretime}</span>
              </div>
              <div className="train-card-body">
                <p className="train-route">
                  From {train.originCityName} to {train.destinationCityName}
                </p>
                <div className="train-info">
                  <span className="train-seats">
                    Economy: {train.capacity_economy}, Business: {train.capacity_econobusiness}
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
