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
      price: "$50",
    },
    {
      id: 2,
      number: "TR 202",
      date: "2025-04-04",
      source: "Chennai",
      destination: "Bangalore",
      seatsLeft: 75,
      price: "$40",
    },
    {
      id: 3,
      number: "TR 303",
      date: "2025-03-20",
      source: "Kolkata",
      destination: "Pune",
      seatsLeft: 50,
      price: "$60",
    },
  ];

  const [filters, setFilters] = useState({
    source: "",
    destination: "",
    date: "",
  });
  const [filteredTrains, setFilteredTrains] = useState(trains);

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
                  {train.source} → {train.destination}
                </p>
                <div className="train-info">
                  <span className="train-seats">Seats Left: {train.seatsLeft}</span>
                  <span className="train-price">Price: {train.price}</span>
                </div>
              </div>
              <button className="book-button">Book Ticket</button>
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
