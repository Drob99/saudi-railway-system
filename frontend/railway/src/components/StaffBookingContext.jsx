import React, { createContext, useContext, useState } from 'react';

const StaffBookingContext = createContext(null);

export const StaffBookingProvider = ({ children }) => {
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingStep, setBookingStep] = useState('trip'); // trip -> passenger -> seats -> payment -> confirmation
  
  const clearBooking = () => {
    setSelectedPassenger(null);
    setSelectedTrip(null);
    setSelectedSeats([]);
    setBookingStep('trip');
  };

  const proceedToNextStep = () => {
    switch (bookingStep) {
      case 'trip':
        setBookingStep('passenger');
        break;
      case 'passenger':
        setBookingStep('seats');
        break;
      case 'seats':
        setBookingStep('payment');
        break;
      case 'payment':
        setBookingStep('confirmation');
        break;
      default:
        break;
    }
  };

  return (
    <StaffBookingContext.Provider 
      value={{
        selectedPassenger,
        setSelectedPassenger,
        selectedTrip,
        setSelectedTrip,
        selectedSeats,
        setSelectedSeats,
        bookingStep,
        setBookingStep,
        clearBooking,
        proceedToNextStep,
      }}
    >
      {children}
    </StaffBookingContext.Provider>
  );
};

export const useStaffBooking = () => {
  const context = useContext(StaffBookingContext);
  if (!context) {
   return {};
  }
  return context;
};

// Optional: Create a HOC to wrap protected staff booking routes
export const withStaffBooking = (Component) => {
  return function WithStaffBookingComponent(props) {
    return (
      <StaffBookingProvider>
        <Component {...props} />
      </StaffBookingProvider>
    );
  };
};