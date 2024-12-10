import React, { useState } from "react";
import ticketPNG from "../images/ticket.png";

const TicketSearch = () => {
  const [searchFilters, setSearchFilters] = useState({
    firstName: "",
    lastName: "",
    status: "",
    date: "",
  });

  const [tickets, setTickets] = useState([
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      status: "confirmed",
      contact: "john.doe@example.com",
      date: "2024-01-15",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      status: "pending",
      contact: "123-456-7890",
      date: "2024-02-20",
    },
    {
      id: 3,
      firstName: "Alice",
      lastName: "Johnson",
      status: "waitlisted",
      contact: "alicejohnson@mail.com",
      date: "2024-03-10",
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters({ ...searchFilters, [name]: value });
  };

  const handleSearch = () => {
    const filteredTickets = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        status: "confirmed",
        contact: "john.doe@example.com",
        date: "2024-01-15",
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        status: "pending",
        contact: "123-456-7890",
        date: "2024-02-20",
      },
      {
        id: 3,
        firstName: "Alice",
        lastName: "Johnson",
        status: "waitlisted",
        contact: "alicejohnson@mail.com",
        date: "2024-03-10",
      },
    ].filter((ticket) => {
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
        (searchFilters.date === "" || ticket.date === searchFilters.date)
      );
    });

    setTickets(filteredTickets);
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
          name="date"
          value={searchFilters.date}
          onChange={handleChange}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <div className="ticket-cards">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
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
              <div className="ticket-contact">{ticket.contact}</div>
              <div className="ticket-date">{ticket.date}</div>
            </div>
            <div className="ticket-buttons">
              <button className="ticket-btn add-btn">Add</button>
              <button className="ticket-btn edit-btn">Edit</button>
              <button className="ticket-btn cancel-btn">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketSearch;
