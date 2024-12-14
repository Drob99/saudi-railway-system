import "./output.css";
import "./styles.css";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import Payment from "./components/Payment";
import PrintTicket from "./components/PrintTicket";
import RailwaySystem from "./components/RailwaySystem";
import Register from "./components/Register";
import Reservations from "./components/Reservations";
import { StaffBookingProvider } from "./components/StaffBookingContext";
import StaffBookingFlow from "./components/StaffBookingFlow";
import StaffReservations from "./components/StaffReservations";
import TicketSearch from "./components/TicketSearch";
import Trains from "./components/Trains";
import ReportsPage from "./components/ReportsPage"; // Import ReportsPage
import UserProvider from "./hooks/use_user";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [currentForm, setCurrentForm] = useState("login");

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <QueryClientProvider client={client}>
      <UserProvider>
        <StaffBookingProvider>
          <Router>
            <div className="bg-gradient-to-t from-primary-950 to-primary-700 min-h-dvh flex justify-center items-center">
              <NavBar />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<RailwaySystem />} />
                <Route path="/tickets" element={<TicketSearch />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/trains" element={<Trains />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/print-ticket" element={<PrintTicket />} />
                <Route
                  path="/staff-reservations"
                  element={<StaffReservations />}
                />
                <Route
                  path="/staff-booking"
                  element={
                    <StaffBookingProvider>
                      <StaffBookingFlow />
                    </StaffBookingProvider>
                  }
                />
                <Route path="/reports" element={<ReportsPage />} />{" "}
                {/* New Route */}
              </Routes>
            </div>
          </Router>
        </StaffBookingProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
