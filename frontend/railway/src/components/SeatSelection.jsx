import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/use_user";
import { API } from "../utils/api";
import { useStaffBooking } from "./StaffBookingContext";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Tooltip from "./ui/ToolTip";

// Enhanced context with passenger data
const SeatSelectionContext = createContext();
export const SeatSelectionProvider = ({ children, maxSelections = 4 }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatAssignments, setSeatAssignments] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSeat, setCurrentSeat] = useState(null);

  const { selectedPassenger } = useStaffBooking();
  const { user } = useUser();

  console.log(selectedPassenger, user);

  // Fetch passengers data
  const {
    data: passengersData,
    isLoading: loadingPassengers,
    error: errorPassengers,
    refetch: refetchPassengers,
  } = useQuery({
    queryKey: ["passengers"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API}/v1/rand/getPassengerAndDependents/${
          selectedPassenger?.personid || user.personid
        }`
      );
      return data;
    },
  });

  // Format passengers for display
  const formatPassengers = (data) => {
    if (!data) return [];

    const mainPassenger = {
      id: data.Passenger.personid,
      name: `${data.Passenger.fname} ${data.Passenger.lname}`,
      type: "primary",
      email: data.Passenger.email,
      phone: data.Passenger.phone,
      identificationDoc: data.Passenger.identificationdoc,
    };

    const dependents = data.Dependents.map((dep) => ({
      id: `${mainPassenger}-${dep.depid}`,
      name: dep.name,
      type: "dependent",
      relation: dep.relationship,
    }));

    return [mainPassenger, ...dependents];
  };

  const passengers = formatPassengers(passengersData?.data);

  // Effect to fetch passengers on mount
  useEffect(() => {
    refetchPassengers();
  }, [refetchPassengers]);

  const handleSeatSelect = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      // Unselect seat
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      setSeatAssignments((prev) => {
        const newAssignments = { ...prev };
        delete newAssignments[seatId];
        return newAssignments;
      });
    } else if (selectedSeats.length < maxSelections) {
      // Show dialog for passenger assignment
      setCurrentSeat(seatId);
      setIsDialogOpen(true);
    }
  };

  const handlePassengerAssignment = (passengerId) => {
    // Check if passenger is already assigned
    const existingSeat = Object.entries(seatAssignments).find(
      ([_, assignedPassenger]) => assignedPassenger.id === passengerId
    );

    if (existingSeat) {
      return;
      // Remove passenger from previous seat
    }

    // Assign new seat
    setSelectedSeats((prev) => [...prev, currentSeat]);
    setSeatAssignments((prev) => ({
      ...prev,
      [currentSeat]: passengers.find((p) => p.id === passengerId),
    }));
    setIsDialogOpen(false);
    setCurrentSeat(null);
  };

  return (
    <SeatSelectionContext.Provider
      value={{
        selectedSeats,
        handleSeatSelect,
        maxSelections,
        seatAssignments,
        passengers,
        isLoading: loadingPassengers,
        error: errorPassengers,
      }}
    >
      {children}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Passenger</DialogTitle>
          </DialogHeader>

          {loadingPassengers ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
            </div>
          ) : errorPassengers ? (
            <div className="py-4 text-center text-red-600">
              Failed to load passengers. Please try again.
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {passengers.map((passenger) => (
                <button
                  key={passenger.id}
                  onClick={() => handlePassengerAssignment(passenger.id)}
                  className={`
                    w-full p-3 text-left rounded-lg border-2
                    transition-colors duration-200
                    ${
                      Object.values(seatAssignments).some(
                        (p) => p.id === passenger.id
                      )
                        ? "bg-gray-100 border-gray-500 text-gray-600 opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50 border-gray-200"
                    }
                  `}
                >
                  <div className="font-medium">{passenger.name}</div>
                  {passenger.type === "dependent" && (
                    <div className="text-sm text-gray-500">
                      {passenger.relation}
                    </div>
                  )}
                  {passenger.type === "primary" && (
                    <div className="text-xs text-gray-500 mt-1">
                      {passenger.phone} • {passenger.email}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              fullWidth
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SeatSelectionContext.Provider>
  );
};

// Custom hook for using the context
const useSeatSelection = () => {
  const context = useContext(SeatSelectionContext);
  if (!context) {
    throw new Error(
      "useSeatSelection must be used within a SeatSelectionProvider"
    );
  }
  return context;
};

const TrainCarriage = ({ carriageNumber, seats }) => {
  const { selectedSeats, handleSeatSelect, seatAssignments } =
    useSeatSelection();

  const getSeatColor = (seat) => {
    if (seat.isOccupied) return "bg-gray-400 cursor-not-allowed";
    if (selectedSeats.includes(seat.id)) return "bg-primary-600 text-white";
    return "bg-white hover:bg-primary-100";
  };

  const getPassengerName = (seatId) => {
    const passenger = seatAssignments[seatId];
    if (!passenger) return null;
    return passenger.type === "dependent" ? `${passenger.name}` : "You";
  };

  // Reorganize seats into rows
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) {
    const row = seats.slice(i, i + 4);
    rows.push({
      left: row.slice(0, 2),
      right: row.slice(2, 4),
    });
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-w-96 max-w-min mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Carriage {carriageNumber}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-600 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Train Carriage Layout */}
      <div className="relative">
        <div className="h-8 font-bold bg-gray-200 rounded-t-lg mb-4 flex items-center justify-center text-sm text-gray-600">
          Front
        </div>

        <div className="flex gap-8">
          {/* Left Side Seats */}
          <div className="flex-1">
            {rows.map((row, rowIndex) => (
              <div key={`left-${rowIndex}`} className="flex gap-2 mb-2">
                {row.left.map((seat) => (
                  <Tooltip
                    open={true}
                    key={seat.id}
                    content={getPassengerName(seat.id)}
                  >
                    <button
                      onClick={() => handleSeatSelect(seat.id)}
                      disabled={seat.isOccupied}
                      className={`
                        w-12 h-12 rounded-lg border border-gray-200
                        flex items-center justify-center
                        transition-colors duration-200 shadow-md font-bold
                        ${getSeatColor(seat)}
                        ${seat.isOccupied ? "opacity-50" : ""}
                        disabled:cursor-not-allowed
                      `}
                    >
                      {seat.number}
                    </button>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>

          {/* Aisle */}
          <div className="w-8 bg-gray-100 rounded-lg"></div>

          {/* Right Side Seats */}
          <div className="flex-1">
            {rows.map((row, rowIndex) => (
              <div key={`right-${rowIndex}`} className="flex gap-2 mb-2">
                {row.right.map((seat) => (
                  <Tooltip
                    open
                    key={seat.id}
                    content={getPassengerName(seat.id)}
                  >
                    <button
                      onClick={() => handleSeatSelect(seat.id)}
                      disabled={seat.isOccupied}
                      className={`
                        w-12 h-12 rounded-lg border border-gray-200
                        flex items-center justify-center
                        transition-colors duration-200 shadow-md font-bold
                        ${getSeatColor(seat)}
                        ${seat.isOccupied ? "opacity-50" : ""}
                        disabled:cursor-not-allowed
                      `}
                    >
                      {seat.number}
                    </button>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="h-8 font-bold bg-gray-200 rounded-b-lg mt-4 flex items-center justify-center text-sm text-gray-600">
          Back
        </div>
      </div>
    </div>
  );
};

const StatusSelectionDialog = ({ open, onOpenChange, onStatusSelect }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Booking Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <button
            onClick={() => onStatusSelect("Confirmed")}
            className="w-full p-4 text-left border rounded-lg hover:bg-primary-50 
                     transition-colors group flex flex-col gap-2"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-gray-900">Confirmed</span>
              <span className="text-primary-600 bg-primary-50 px-2 py-1 rounded text-sm ">
                Immediate
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Booking will be confirmed immediately and seats will be reserved.
            </p>
          </button>

          <button
            onClick={() => onStatusSelect("Waiting")}
            className="w-full p-4 text-left border rounded-lg hover:bg-primary-50 
                     transition-colors group flex flex-col gap-2"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-gray-900">
                Waiting for Payment
              </span>
              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
                Pending
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Customer will receive an email with payment instructions. Seats
              will be temporarily held until payment is completed.
            </p>
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// Selection Summary Component

const SelectionSummary = ({ tripId, trainClass = "Economy" }) => {
  const { selectedSeats, maxSelections, seatAssignments } = useSeatSelection();
  const [numOfLuggage, setNumOfLuggage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const navigate = useNavigate();

  // Create an array of passenger-seat pairs for easier rendering
  const assignmentPairs = Object.entries(seatAssignments).map(
    ([seatId, passenger]) => ({
      seatId,
      passenger,
    })
  );

  const { selectedPassenger } = useStaffBooking();

  const handleBooking = async () => {
    try {
      setError(null);

      const mainPassenger = Object.values(seatAssignments).find(
        (p) => p.type === "primary"
      );
      const dependents = Object.values(seatAssignments)
        .filter((p) => p.type === "dependent")
        .map((p) => +p.id.split("-")[1]);

      const seatNumbers = Object.keys(seatAssignments).map(
        (seatId) => +seatId + 1
      );

      const bookingData = {
        class: trainClass,
        dependents,
        seatNumbers,
        tripId,
        passengerId: selectedPassenger
          ? selectedPassenger.personid
          : mainPassenger.id,
        numOfLuggage,
      };
      setPendingBookingData(bookingData);
      if (selectedPassenger?.personid) {
        setShowStatusDialog(true);
      } else {
        handleStatusSelect();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to prepare booking data");
    }
  };

  // New function to handle status selection and proceed with booking
  const handleStatusSelect = async (status) => {
    try {
      setIsLoading(true);
      setShowStatusDialog(false);

      const bookingData = {
        ...pendingBookingData,
        status,
      };

      const response = await axios.post(
        `${API}/v1/booking/create${selectedPassenger ? "" : "-passenger"}`,
        bookingData
      );

      if (response.data.success) {
        if (!status) {
          navigate("/payment", {
            state: {
              paymentId: response.data.paymentId,
              totalCost: response.data.totalCost,
              bookingDetails: bookingData,
              passengers: Object.values(seatAssignments),
            },
          });
        } else {
          setBookingDetails({
            ...bookingData,
            passengers: Object.values(seatAssignments),
          });
          setShowSuccessDialog(true);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Summary Panel */}
      <div className="mt-4 p-4 rounded-lg shadow-md fixed bg-white top-10 right-5">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-medium text-gray-900">Selected Seats</h3>
            {assignmentPairs.length > 0 ? (
              <div className="mt-2 space-y-2">
                {assignmentPairs.map(({ seatId, passenger }) => (
                  <div
                    key={seatId}
                    className="flex items-start gap-3 text-sm border-b border-gray-100 pb-2"
                  >
                    <div className="flex items-center justify-center bg-primary-50 text-primary-700 font-medium rounded-md w-12 h-8">
                      #{+seatId + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {passenger.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {passenger.type === "dependent"
                          ? passenger.relation
                          : passenger.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No seats selected</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Number of Luggage
            </label>
            <input
              type="number"
              min="0"
              value={numOfLuggage}
              onChange={(e) => setNumOfLuggage(Math.max(0, +e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-gray-600 pt-2 border-t border-gray-100">
              {maxSelections - selectedSeats.length} seats remaining to select
            </div>

            <button
              onClick={handleBooking}
              disabled={isLoading || assignmentPairs.length === 0}
              className={`
                mt-2 px-4 py-2 rounded-md text-white text-sm font-medium
                ${
                  assignmentPairs.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                }
                transition-colors duration-200
                disabled:opacity-50
              `}
            >
              {isLoading ? "Booking..." : "Book Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bookingDetails?.status === "Waiting" && (
                <div className="mt-4 bg-orange-50 p-4 rounded-lg text-sm text-orange-700">
                  An email will be sent to the customer with payment
                  instructions. The booking will be confirmed once payment is
                  completed.
                </div>
              )}
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
                Booking Successful!
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Passengers
                </h4>
                <div className="mt-1 space-y-1">
                  {bookingDetails?.passengers.map((passenger) => (
                    <div key={passenger.id} className="text-sm text-gray-600">
                      {passenger.name}
                      {passenger.type === "dependent" && (
                        <span className="text-gray-500">
                          {" "}
                          • {passenger.relation}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Seats</h4>
                <p className="text-sm text-gray-600">
                  {bookingDetails?.seatNumbers.join(", ")}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Class</h4>
                <p className="text-sm text-gray-600">{bookingDetails?.class}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Luggage</h4>
                <p className="text-sm text-gray-600">
                  {bookingDetails?.numOfLuggage} pieces
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Your booking confirmation has been sent to{" "}
              {
                bookingDetails?.passengers.find((p) => p.type === "primary")
                  ?.email
              }
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
              }}
            >
              Close
            </Button>
            <Button onClick={() => window.print()}>Print Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <StatusSelectionDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onStatusSelect={handleStatusSelect}
      />

      {/* Modified Success Dialog to show different messages based on status */}
    </>
  );
};
/**
 *
 * @param {{seats:{id: number;number: number;isOccupied: boolean;type: string;}[]}} p
 * @returns
 */
const SeatSelection = ({ seats, tripId, trainClass }) => {
  // Generate seats with the correct numbering pattern

  const carriages = [];
  for (let i = 0; i < Math.ceil(seats.length / 40); i++) {
    carriages.push(seats.slice(40 * i, 40 * i + 40));
  }
  return (
    <SeatSelectionProvider maxSelections={4}>
      <div className="max-w-3xl mx-auto p-4 min-h-dvh py-24 flex flex-col">
        {carriages.map((carriageSeats, index) => (
          <React.Fragment key={index}>
            <TrainCarriage carriageNumber={index + 1} seats={carriageSeats} />
            {index < carriages.length - 1 && (
              <div className="flex items-center justify-center">
                <div className="w-1/4 h-8 bg-white shadow-md"></div>
              </div>
            )}
          </React.Fragment>
        ))}
        <SelectionSummary
          seats={seats}
          tripId={tripId}
          trainClass={trainClass}
        />
      </div>
    </SeatSelectionProvider>
  );
};

export default SeatSelection;
