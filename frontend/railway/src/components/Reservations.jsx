import React, { useState } from "react";

const Reservations = () => {
  const [bookingID, setBookingID] = useState("");
  const [reservationDetails, setReservationDetails] = useState(null);
  const [error, setError] = useState("");

  // Dummy reservations data
  const reservations = [
    {
      bookingid: "12345",
      numofpassengers: 2,
      numofluggage: 3,
      seats: ["A1", "A2"],
      basefare: 130.43,
      status: "confirmed",
    },
    {
      bookingid: "67890",
      numofpassengers: 1,
      numofluggage: 1,
      seats: ["B3"],
      basefare: 69.57,
      status: "waitlisted",
    },
    {
      bookingid: "54321",
      numofpassengers: 3,
      numofluggage: 4,
      seats: ["C4", "C5", "C6"],
      basefare: 217.39,
      status: "canceled",
    },
  ];

  const handleSearch = () => {
    // Find reservation by booking ID
    const foundReservation = reservations.find(
      (reservation) => reservation.bookingid === bookingID
    );

    if (foundReservation) {
      setReservationDetails(foundReservation);
      setError("");
    } else {
      setReservationDetails(null);
      setError("No reservation found with the entered booking ID.");
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
          placeholder="Enter Booking ID"
          value={bookingID}
          onChange={(e) => setBookingID(e.target.value)}
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
            <p>
              <strong>Number of Passengers:</strong>{" "}
              {reservationDetails.numofpassengers}
            </p>
            <p>
              <strong>Number of Luggage:</strong>{" "}
              {reservationDetails.numofluggage}
            </p>
            <p>
              <strong>Seats:</strong> {reservationDetails.seats.join(", ")}
            </p>
            <p>
              <strong>Total Price (with VAT):</strong> $
              {(reservationDetails.basefare * 1.15).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
