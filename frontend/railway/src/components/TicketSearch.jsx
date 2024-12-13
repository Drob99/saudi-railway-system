import React, { useState } from "react";
import ticketPNG from "../images/ticket.png";

const TicketSearch = () => {
  const [searchFilters, setSearchFilters] = useState({
    firstName: "",
    lastName: "",
    status: "",
    departuretime: "",
  });

  const [tickets, setTickets] = useState([
    {
      bookingid: 1,
      firstName: "John",
      lastName: "Doe",
      status: "confirmed",
      ContactInfo: "john.doe@example.com",
      departuretime: "2024-01-15",
      class: "economy",
      SeatNumber: "A12",
    },
    {
      bookingid: 2,
      firstName: "Jane",
      lastName: "Smith",
      status: "pending",
      ContactInfo: "123-456-7890",
      departuretime: "2024-02-20",
      class: "business",
      SeatNumber: "B3",
    },
    {
      bookingid: 3,
      firstName: "Alice",
      lastName: "Johnson",
      status: "waitlisted",
      ContactInfo: "alicejohnson@mail.com",
      departuretime: "2024-03-10",
      class: "economy",
      SeatNumber: "C7",
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters({ ...searchFilters, [name]: value });
  };

  const handleSearch = () => {
    const filteredTickets = tickets.filter((ticket) => {
      return (
        (searchFilters.firstName === "" ||
          ticket.firstName
            .toLowerCase()
            .includes(searchFilters.firstName.toLowerCase())) &&
        (searchFilters.lastName === "" ||
          ticket.lastName
            .toLowerCase()
            .includes(searchFilters.lastName.toLowerCase())) &&
        (searchFilters.status === "" || ticket.status === searchFilters.status) &&
        (searchFilters.departuretime === "" ||
          ticket.departuretime === searchFilters.departuretime)
      );
    });

    setTickets(filteredTickets);
  };

  const handleStatusChange = (bookingid, newStatus) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.bookingid === bookingid
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
  };

  const statusColors = {
    pending: "orange",
    waitlisted: "#017F99",
    canceled: "red",
    confirmed: "green",
  };

  return (
    <div className="ticket-container">
      <h1>Search Tickets</h1>
      <div className="search-form">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={searchFilters.firstName}
          onChange={handleChange}
          className="search-input"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={searchFilters.lastName}
          onChange={handleChange}
          className="search-input"
        />
        <select
          name="status"
          value={searchFilters.status}
          onChange={handleChange}
          className="search-input"
        >
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="canceled">Canceled</option>
          <option value="confirmed">Confirmed</option>
        </select>
        <input
          type="date"
          name="departuretime"
          value={searchFilters.departuretime}
          onChange={handleChange}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <div className="ticket-cards">
        {tickets.map((ticket) => (
          <div key={ticket.bookingid} className="ticket-card">
            {/* Ticket image at top left */}
            <div className="ticket-image">
              <img src={ticketPNG} alt="ticket" />
            </div>
            {/* Status at the top right */}
            <div
              className="ticket-status"
              style={{
                backgroundColor: statusColors[ticket.status] || "grey",
              }}
            >
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </div>
            <div className="ticket-info">
              <div className="ticket-name">
                {ticket.firstName} {ticket.lastName}
              </div>
              <div className="ticket-contact">{ticket.ContactInfo}</div>
              <div className="ticket-date">{ticket.departuretime}</div>
            </div>
            <div className="ticket-buttons">
              <button
                className="ticket-btn add-btn"
                onClick={() => handleStatusChange(ticket.bookingid, "confirmed")}
              >
                Add
              </button>
              <button
                className="ticket-btn edit-btn"
                onClick={() => alert("Edit functionality not implemented yet!")}
              >
                Edit
              </button>
              <button
                className="ticket-btn cancel-btn"
                onClick={() => handleStatusChange(ticket.bookingid, "canceled")}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketSearch;
