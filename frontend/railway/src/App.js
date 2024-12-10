import React, { useState } from "react";
import "./styles.css";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import RailwaySystem from "./components/RailwaySystem";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [currentForm, setCurrentForm] = useState("login");

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
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
          <Route path="/railway" element={<RailwaySystem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
