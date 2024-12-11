import "./styles.css";

import React, { useState } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import RailwaySystem from "./components/RailwaySystem";
import TicketSearch from "./components/TicketSearch";
import Reservations from "./components/Reservations";
import Trains from "./components/Trains";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";

function App() {
  const [currentForm, setCurrentForm] = useState("login");

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <Router>
      <div className="App">
        {/* Render NavBar globally to ensure it's always at the top */}
        <NavBar />
        <Routes>
          {/* Login/Register Routes */}
          <Route
            path="/login"
            element={
              currentForm === "login" ? (
                <Login onFormSwitch={toggleForm} />
              ) : (
                <Register onFormSwitch={toggleForm} />
              )
            }
          />

          {/* Main Railway System Route */}
          <Route path="/railway" element={<RailwaySystem />} />

          {/* Ticket Search Page */}
          <Route path="/tickets" element={<TicketSearch />} />

          {/* Reservations Search Page */}
          <Route path="/reservations" element={<Reservations />} />

          {/* Trains Search Page */}
          <Route path="/trains" element={<Trains />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
