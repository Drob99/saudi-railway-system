import { useStaffBooking, withStaffBooking } from "./StaffBookingContext";

import SeatSelection from "./SeatSelection";
import Payment from "./Payment";

import { Navigate } from "react-router-dom";
import PassengerSearch from "./PasengerSearch";
import BookingConfirmation from "./BookingConfirmation";
import StaffTripSelection from "./StaffTripSelection";
import { useQuery } from "react-query";
import axios from "axios";
import { API } from "../utils/api";

const StepIndicator = ({ currentStep, onStepClick }) => {
  const steps = [
    { key: "trip", label: "Select Trip" },
    { key: "passenger", label: "Select Passenger" },
    { key: "seats", label: "Choose Seats" },
    { key: "payment", label: "Payment" },
  ];

  // Get index of current step
  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  // Function to determine if a step is clickable
  const canNavigateToStep = (stepIndex) => {
    // Can always go back
    return stepIndex <= currentStepIndex;
  };

  return (
    <div className="w-full py-4 px-6 bg-white shadow-sm mb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-center ${
                index !== steps.length - 1 ? "flex-1" : ""
              }`}
            >
              <div className="flex flex-col items-center">
                <button
                  onClick={() =>
                    canNavigateToStep(index) && onStepClick(step.key)
                  }
                  disabled={!canNavigateToStep(index)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-200
                    ${
                      currentStep === step.key
                        ? "bg-primary-600 text-white"
                        : index < currentStepIndex
                        ? "bg-primary-100 text-primary-600 hover:bg-primary-200"
                        : "bg-gray-200 text-gray-600"
                    }
                    ${
                      canNavigateToStep(index)
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  `}
                  aria-label={`Go to ${step.label}`}
                >
                  {index + 1}
                </button>
                <span
                  className={`
                  text-sm mt-1
                  ${
                    currentStep === step.key
                      ? "text-primary-600 font-medium"
                      : "text-gray-600"
                  }
                  ${index < currentStepIndex ? "text-primary-600" : ""}
                `}
                >
                  {step.label}
                </span>
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-[2px] mx-4 transition-colors duration-200
                    ${
                      steps.indexOf(steps.find((s) => s.key === currentStep)) >
                      index
                        ? "bg-primary-600"
                        : "bg-gray-200"
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StaffBookingFlow = () => {
  const { 
    bookingStep, 
    setBookingStep,
    selectedTrip, 
    selectedPassenger, 
    selectedSeats 
  } = useStaffBooking();

  const {
    data: seatsData,
    isLoading: loadingSeats,
    error: errorSeats,
    refetch: searchSeats,
    isStale,
  } = useQuery({
    queryKey: ["seats", selectedTrip],
    queryFn: async () => {
      try {
        if (!selectedTrip) return;
        const { data } = await axios.get(`${API}/v1/rand/getSeatAvailability`, {
          params: {
            tripId: selectedTrip.tripid,
            classType: selectedTrip.class,
          },
        });
        return data;
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    enabled: false,
    retry: 1,
  });

  // Validation for each step
  const validateStep = (step) => {
    switch (step) {
      case "trip":
        return true; // Can always go back to trip selection
      case "passenger":
        return !!selectedTrip;
      case "seats":
        return !!selectedTrip && !!selectedPassenger;
      case "payment":
        return !!selectedTrip && !!selectedPassenger && selectedSeats.length > 0;
      default:
        return true;
    }
  };

  const handleStepClick = (step) => {
    // Check if we can navigate to this step
    if (!validateStep(step)) {
      // Show appropriate error message
      const messages = {
        passenger: "Please select a trip first",
        seats: "Please select a passenger first",
        payment: "Please select seats first"
      };
      
      alert(messages[step] || "Cannot proceed to this step yet");
      return;
    }

    // If going to seats step, ensure we fetch seat data
    if (step === "seats" && (!seatsData || isStale)) {
      searchSeats();
    }

    setBookingStep(step);
  };

  // Prevent accessing invalid steps directly
  if (!validateStep(bookingStep)) {
    return <Navigate to="/staff/booking" replace />;
  }

  // Auto-fetch seats data when needed
  if (bookingStep === "seats" && !seatsData && !loadingSeats) {
    searchSeats();
  }

  return (
    <div className="min-h-screen w-full max-w-7xl bg-gray-100 my-20 rounded-md overflow-hidden">
      <StepIndicator 
        currentStep={bookingStep} 
        onStepClick={handleStepClick} 
      />

      <div className="w-full mx-auto p-6">
        {bookingStep === "trip" && <StaffTripSelection />}
        {bookingStep === "passenger" && <PassengerSearch />}
        {bookingStep === "seats" && (
          loadingSeats ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
            </div>
          ) : seatsData ? (
            <SeatSelection
              tripId={selectedTrip.tripid}
              trainClass={selectedTrip.class}
              seats={Object.entries(seatsData.seatAvailability).map((e, i) => ({
                id: i,
                number: e[0],
                isOccupied: e[1],
                type: selectedTrip.class,
              }))}
            />
          ) : (
            <div className="text-center text-gray-600">
              Failed to load seats. Please try again.
            </div>
          )
        )}
        {bookingStep === "payment" && <Payment />}
        {bookingStep === "confirmation" && <BookingConfirmation />}
      </div>
    </div>
  );
};

// Higher-order component to wrap with provider

export default StaffBookingFlow;
