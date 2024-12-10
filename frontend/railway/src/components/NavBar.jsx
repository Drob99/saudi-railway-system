import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/railway" className="nav-link">
            Home Page
          </Link>
        </li>
        <li>
          <Link to="/tickets" className="nav-link">
            Tickets
          </Link>
        </li>
        <li>
          <Link to="/trains" className="nav-link">
            Trains
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
