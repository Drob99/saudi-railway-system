import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PrintTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookings, passengers } = location.state || {};

  useEffect(() => {
    // Automatically open print dialog when component mounts
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        window.print();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Redirect if no booking data
  if (!bookings || !passengers) {
    navigate("/");
    return null;
  }

  return (
    <>
      {/* Screen-only controls */}

      {/* Printable content */}
      <div className="w-full">
        {bookings.map((booking, index) => (
          <div
            key={booking.bookingid}
            className={`
              page-break-after-always 
              bg-white
              p-8 
              print:mb-0
              print:border-none
              w-full h-dvh
            `}
          >
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Railway Ticket</h1>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Booking ID:</p>
                  <p className="font-bold">#{booking.bookingid}</p>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Passenger Details</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{passengers[index].name}</p>
                <p className="text-gray-600">
                  Type:{" "}
                  {passengers[index].type === "dependent"
                    ? `Dependent (${passengers[index].relation})`
                    : "Primary"}
                </p>
              </div>
            </div>

            {/* Journey Details */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Journey Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>
                      {new Date(booking.tripDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span>{booking.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seat Number:</span>
                    <span className="font-bold">{booking.seatnumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Luggage:</span>
                    <span>{booking.numofluggage} piece(s)</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Trip Information</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trip ID:</span>
                    <span>{booking.tripid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Train:</span>
                    <span>{booking.trainid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Track:</span>
                    <span>{booking.trackid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fare:</span>
                    <span>${booking.basefare}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-between items-center border-t-2 border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                <p>Please present this ticket when boarding</p>
                <p>Keep this ticket safe and accessible during your journey</p>
              </div>
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">QR Code</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print-only styles */}
      <style type="text/css">
        {`
          @media print {
            @page {
              size: A4;
              margin: 0.5cm;
            }
            .navbar {
              display:none;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .page-break-after-always {
              page-break-after: always;
            }
          }
        `}
      </style>
    </>
  );
};

export default PrintTicket;
