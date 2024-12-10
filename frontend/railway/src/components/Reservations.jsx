import React, { useState } from "react";

const Reservations = () => {
  const [reservationID, setReservationID] = useState("");
  const [reservationDetails, setReservationDetails] = useState(null);
  const [error, setError] = useState("");

  // Dummy reservations data
  const reservations = [
    {
      id: "12345",
      passengers: 2,
      luggage: 3,
      seats: ["A1", "A2"],
      price: 150.0,
      status: "confirmed",
    },
    {
      id: "67890",
      passengers: 1,
      luggage: 1,
      seats: ["B3"],
      price: 80.0,
      status: "waitlisted",
    },
    {
      id: "54321",
      passengers: 3,
      luggage: 4,
      seats: ["C4", "C5", "C6"],
      price: 250.0,
      status: "canceled",
    },
  ];

  const handleSearch = () => {
    // Find reservation by ID
    const foundReservation = reservations.find(
      (reservation) => reservation.id === reservationID
    );

    if (foundReservation) {
      setReservationDetails(foundReservation);
      setError("");
    } else {
      setReservationDetails(null);
      setError("No reservation found with the entered ID.");
    }
  };

  const statusColors = {
    pending: "orange",
    waitlisted: "#017F99",
    canceled: "red",
    confirmed: "green",
  };

  return (
    <div className="reservations-container">
      <h1>Find Your Reservation</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter Reservation ID"
          value={reservationID}
          onChange={(e) => setReservationID(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Show Details
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {reservationDetails && (
        <div className="reservation-card">
          <div
            className="reservation-status"
            style={{
              backgroundColor:
                statusColors[reservationDetails.status] || "grey",
            }}
          >
            {reservationDetails.status.charAt(0).toUpperCase() +
              reservationDetails.status.slice(1)}
          </div>
          <div className="reservation-info">
            <p><strong>Number of Passengers:</strong> {reservationDetails.passengers}</p>
            <p><strong>Number of Luggage:</strong> {reservationDetails.luggage}</p>
            <p><strong>Seats:</strong> {reservationDetails.seats.join(", ")}</p>
            <p>
              <strong>Total Price (with VAT):</strong> $
              {(reservationDetails.price * 1.15).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
