import axios from "axios";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../utils/api";
import { Alert, AlertDescription, AlertTitle } from "./ui/Alert";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId, totalCost, bookingDetails, passengers } =
    location.state || {};
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [systemError, setSystemError] = useState(null);

  const {
    mutate: processPayment,
    isLoading,
    reset: resetMutation,
  } = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await axios.post(
          `${API}/v1/booking/payment/${paymentId}`,
          {
            paymentId,
            amount: totalCost,
            currency: "USD",
            cardDetails: {
              number: formData.get("cardNumber"),
              expiry: formData.get("expiryDate"),
              cvv: formData.get("cvv"),
              name: formData.get("cardholderName"),
            },
          }
        );

        if (!response.data.success) {
          throw new Error("Payment processing failed");
        }

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (!err.response) {
            throw new Error("Network error occurred");
          }

          switch (err.response.status) {
            case 402:
              throw new Error("Payment was declined");
            case 429:
              throw new Error("Too many attempts. Please wait a moment");
            default:
              throw new Error(
                err.response.data.message || "Payment processing failed"
              );
          }
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      setBookingConfirmation(data);
      setShowSuccessDialog(true);
    },
    onError: (error) => {
      setSystemError({
        title: "Payment Failed",
        description: error.message,
      });
      setShowErrorDialog(true);
    },
  });

  const validateForm = (formData) => {
    const errors = {};

    if (!/^[0-9\s]{13,19}$/.test(formData.get("cardNumber"))) {
      errors.cardNumber = "Please enter a valid card number";
    }

    const expiry = formData.get("expiryDate");
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) {
      errors.expiryDate = "Please enter a valid expiry date (MM/YY)";
    } else {
      const [month, year] = expiry.split("/");
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiryDate < new Date()) {
        errors.expiryDate = "Card has expired";
      }
    }

    if (!/^[0-9]{3,4}$/.test(formData.get("cvv"))) {
      errors.cvv = "Please enter a valid CVV";
    }

    if (!/^[A-Za-z\s]{2,}$/.test(formData.get("cardholderName"))) {
      errors.cardholderName = "Please enter a valid cardholder name";
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resetMutation();
    setFormErrors({});
    setSystemError(null);

    const formData = new FormData(e.target);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    processPayment(formData);
  };

  // Initial validation
  useEffect(() => {
    if (!paymentId || !totalCost || !bookingDetails || !passengers) {
      setSystemError({
        title: "Session Error",
        description: "Your payment session has expired or is invalid.",
      });
      setShowErrorDialog(true);
    }
  }, []);

  if (!paymentId || !totalCost || !bookingDetails || !passengers) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <Alert variant="destructive">
          <AlertTitle>Invalid Session</AlertTitle>
          <AlertDescription>
            Your payment session has expired or is invalid. Please start your
            booking again.
          </AlertDescription>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Return to Booking
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 mt-12 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-4">Booking Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Passengers</span>
              <span>{passengers.length} people</span>
            </div>
            <div className="flex justify-between">
              <span>Seats</span>
              <span>{bookingDetails.seatNumbers.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span>Luggage</span>
              <span>{bookingDetails.numOfLuggage} pieces</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>${totalCost}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              name="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              className={`w-full p-2 border rounded-md ${
                formErrors.cardNumber ? "border-red-500" : ""
              }`}
              onChange={() => {
                if (formErrors.cardNumber) {
                  setFormErrors({ ...formErrors, cardNumber: null });
                }
              }}
            />
            {formErrors.cardNumber && (
              <p className="text-red-500 text-sm">{formErrors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                name="expiryDate"
                type="text"
                placeholder="MM/YY"
                className={`w-full p-2 border rounded-md ${
                  formErrors.expiryDate ? "border-red-500" : ""
                }`}
                onChange={() => {
                  if (formErrors.expiryDate) {
                    setFormErrors({ ...formErrors, expiryDate: null });
                  }
                }}
              />
              {formErrors.expiryDate && (
                <p className="text-red-500 text-sm">{formErrors.expiryDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                name="cvv"
                type="text"
                placeholder="123"
                className={`w-full p-2 border rounded-md ${
                  formErrors.cvv ? "border-red-500" : ""
                }`}
                onChange={() => {
                  if (formErrors.cvv) {
                    setFormErrors({ ...formErrors, cvv: null });
                  }
                }}
              />
              {formErrors.cvv && (
                <p className="text-red-500 text-sm">{formErrors.cvv}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cardholder Name
            </label>
            <input
              name="cardholderName"
              type="text"
              placeholder="John Doe"
              className={`w-full p-2 border rounded-md ${
                formErrors.cardholderName ? "border-red-500" : ""
              }`}
              onChange={() => {
                if (formErrors.cardholderName) {
                  setFormErrors({ ...formErrors, cardholderName: null });
                }
              }}
            />
            {formErrors.cardholderName && (
              <p className="text-red-500 text-sm">
                {formErrors.cardholderName}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing..." : `Pay $${totalCost}`}
          </Button>
        </form>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                Payment Successful!
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Payment ID
                </h4>
                <p className="text-sm text-gray-600">
                  #{bookingConfirmation?.paymentId}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Booking References
                </h4>
                <div className="text-sm text-gray-600">
                  {bookingConfirmation?.bookings.map((booking) => (
                    <div key={booking.bookingid} className="mt-1">
                      #{booking.bookingid} - Seat {booking.seatnumber}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Travel Class
                </h4>
                <p className="text-sm text-gray-600">
                  {bookingConfirmation?.bookings[0].class}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Travel Date
                </h4>
                <p className="text-sm text-gray-600">
                  {new Date(
                    bookingConfirmation?.bookings[0].date
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Total Paid
                </h4>
                <p className="text-sm text-gray-600">${totalCost}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate("/");
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                navigate("/print-ticket", {
                  state: {
                    bookings: bookingConfirmation.bookings,
                    passengers: passengers,
                  },
                });
              }}
            >
              Print Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {systemError?.title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>{systemError?.description}</DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowErrorDialog(false);
                // navigate("/");
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Payment;
