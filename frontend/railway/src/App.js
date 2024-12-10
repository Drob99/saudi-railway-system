import "./styles.css";

import React, { useState } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import RailwaySystem from "./components/RailwaySystem";
import TicketSearch from "./components/TicketSearch";
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
            path="/"
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
