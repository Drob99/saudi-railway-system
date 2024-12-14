import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../hooks/use_user";

const NavBar = () => {
  const location = useLocation();
  const { isStaff, user } = useUser();

  const navItems = [
    ...(!user
      ? []
      : [
          { path: "/", label: "Home Page" },
          { path: "/reports", label: "Reports" }, // Add Reports for both staff and passengers
          ...(isStaff
            ? [
                { path: "/staff-booking", label: "Staff Booking" },
                { path: "/staff-reservations", label: "Staff Reservations" },
              ]
            : []),
        ]),
    { path: "/login", label: "Log out" },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  return (
    <nav className="navbar glass">
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`
                px-4 py-2 
                text-sm 
                transition-colors duration-200
                font-bold
                rounded-md
                hover:bg-primary-700 hover:text-white
                ${isActive(item.path) ? "bg-primary-700 text-white" : ""}
              `}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
