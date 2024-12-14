import React from "react";
import { useNavigate } from "react-router-dom";
import { useStaffBooking } from "./StaffBookingContext";
import { CheckCircle, Download, Mail, Phone, Printer } from "lucide-react";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { selectedPassenger, clearBooking } = useStaffBooking();

  const bookingDetails = {
    bookingId: "BK" + Math.random().toString().slice(2, 8),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    // These would come from your previous booking steps
    seats: ["A1", "A2"],
    class: "Economy",
    totalAmount: 299.99,
  };

  const handleNewBooking = () => {
    clearBooking();
    navigate("/staff/booking");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-50 p-6 flex items-center gap-4">
          <div className="rounded-full bg-primary-100 p-2">
            <CheckCircle className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Confirmed
            </h1>
            <p className="text-sm text-gray-600">
              Booking ID: {bookingDetails.bookingId}
            </p>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Passenger Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">
                {selectedPassenger.fname} {selectedPassenger.lname}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID Document</p>
              <p className="font-medium">
                {selectedPassenger.identificationdoc}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="font-medium">{selectedPassenger.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <p className="font-medium">{selectedPassenger.phone}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Journey Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">{bookingDetails.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-medium">{bookingDetails.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seats</p>
              <p className="font-medium">{bookingDetails.seats.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-medium">{bookingDetails.class}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount Paid</span>
            <span className="text-xl font-bold text-primary-600">
              ${bookingDetails.totalAmount}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex flex-wrap gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Ticket
          </button>
          <button
            onClick={() => {
              /* Handle download */
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download E-Ticket
          </button>
          <button
            onClick={handleNewBooking}
            className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            New Booking
          </button>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>A confirmation email has been sent to {selectedPassenger.email}</p>
        <p className="mt-2">
          For any queries, please contact our support team at
          support@railway.com
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
