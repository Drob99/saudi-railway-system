import axios from "axios";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useUser } from "../hooks/use_user";
import trainLogo from "../images/trainLogo.png";
import { API } from "../utils/api";
import SeatSelection from "./SeatSelection";

// Types
const TRAIN_CLASSES = {
  ECONOMY: "Economy",
  BUSINESS: "Business",
  FIRST: "First",
};

// Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center h-64 text-red-600">
    <p>Error: {message}</p>
  </div>
);

const CitySelect = ({
  label,
  name,
  value,
  onChange,
  cities,
  disabled = false,
}) => (
  <div className="flex flex-col">
    <label htmlFor={name}>
      <span className="text-white font-bold">{label}</span>
    </label>
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="rounded-md p-3 mx-2 min-w-64 text-black disabled:bg-gray-100"
    >
      <option value="">Select {label}</option>
      {cities?.map((city) => (
        <option key={city.cityid} value={city.name}>
          {city.name} ({city.region})
        </option>
      ))}
    </select>
  </div>
);

const TrainCard = ({ train, onBookTicket }) => {
  // Format dates for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="motion-preset-slide-up-md train-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={trainLogo} alt="Train Logo" className="w-10 h-10" />
          <div>
            <h3 className="font-bold text-lg text-primary-700">
              {train.trainnameenglish}
            </h3>
            <p className="text-gray-600 text-sm">{train.trainnamearabic}</p>
          </div>
        </div>
        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
          {train.availableseats} seats left
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-300">Departure</p>
            <p className="font-medium">{formatTime(train.departuretime)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Arrival</p>
            <p className="font-medium">{formatTime(train.arrivaltime)}</p>
          </div>
        </div>

        <div className="text-center bg-gray-50 py-2 rounded">
          <p className="text-sm text-gray-600">
            {formatDate(train.departuretime)}
          </p>
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-lg font-bold text-primary-700">
            SAR {parseFloat(train.ticketprice).toFixed(2)}
          </p>
          <button
            onClick={() => onBookTicket(train)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 
                     transition-colors duration-200 font-medium"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component

const RailwaySystem = () => {
  // State
  const [filters, setFilters] = useState({
    originCity: "",
    destinationCity: "",
    departureDate: "",
    class: TRAIN_CLASSES.ECONOMY,
  });
  const { user } = useUser();
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);

  // Fetch cities data
  const {
    data: citiesData,
    isLoading: loadingCities,
    error: errorCities,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/v1/cities`);
      return data;
    },
  });

  const {
    data: seatsData,
    isLoading: loadingSeats,
    error: errorSeats,
    refetch: searchSeats,
  } = useQuery({
    queryKey: ["seats", selectedTrain],
    queryFn: async () => {
      try {
        if (!selectedTrain) return;
        const { data } = await axios.get(`${API}/v1/rand/getSeatAvailability`, {
          params: {
            tripId: selectedTrain.tripid,
            classType: filters.class,
          },
        });
        return data;
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    enabled: false, // Don't fetch automatically
    retry: 1, // Only retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch trains data
  const {
    data: trainsData,
    isLoading: loadingTrains,
    error: errorTrains,
    refetch: searchTrains,
  } = useQuery({
    queryKey: ["trains", filters],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${API}/v1/trains/search`, {
          params: {
            originCity: filters.originCity,
            destinationCity: filters.destinationCity,
            departureDate: filters.departureDate,
            class: filters.class,
          },
        });
        return data;
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    enabled: false, // Don't fetch automatically
    retry: 1, // Only retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "departureDate") {
      // Ensure date is not in the past
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert("Please select a future date");
        return;
      }
    }

    if (
      (name === "originCity" && value === filters.destinationCity) ||
      (name === "destinationCity" && value === filters.originCity)
    ) {
      alert("Origin and destination cities cannot be the same");
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
    setSearchInitiated(false); // Reset search state when filters change
  };

  const handleSearch = async () => {
    const { originCity, destinationCity, departureDate } = filters;

    if (!originCity || !destinationCity || !departureDate) {
      alert("Please select origin, destination and date");
      return;
    }

    setSearchInitiated(true);
    await searchTrains();
  };

  // Loading states
  if (loadingCities || loadingSeats) return <LoadingSpinner />;
  if (errorCities)
    return (
      <ErrorMessage
        message={
          errorCities.message ||
          "Failed to load cities. Please try again later."
        }
      />
    );

  if (errorSeats)
    return (
      <ErrorMessage
        message={
          errorSeats.message || "Failed to load cities. Please try again later."
        }
      />
    );
  // Booking form view
  if (selectedTrain) {
    if (seatsData?.seatAvailability && !errorSeats) {
      console.log(
        Object.entries(seatsData.seatAvailability),
        Object.entries(seatsData.seatAvailability).map((e, i) => ({
          id: i,
          number: e[0],
          isOccupied: e[1],
          type: filters.class,
        }))
      );
      return (
        <SeatSelection
          tripId={selectedTrain.tripid}
          trainClass={filters.class}
          seats={Object.entries(seatsData.seatAvailability).map((e, i) => ({
            id: i,
            number: e[0],
            isOccupied: e[1],
            type: filters.class,
          }))}
        />
      );
    }
    searchSeats();
  }

  // Search view
  return (
    <div className="railway-system p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">
        Welcome {user.fname} <br />
        Train Booking System
      </h1>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="search-form flex justify-center items-end gap-4 mb-8"
      >
        <CitySelect
          label="Origin City"
          name="originCity"
          value={filters.originCity}
          onChange={handleInputChange}
          cities={citiesData?.cities}
        />

        <CitySelect
          label="Destination City"
          name="destinationCity"
          value={filters.destinationCity}
          onChange={handleInputChange}
          cities={citiesData?.cities}
          disabled={!filters.originCity}
        />

        <div className="flex flex-col">
          <label htmlFor="departureDate">
            <span className="text-white font-bold">Date</span>
          </label>
          <input
            type="date"
            name="departureDate"
            id="departureDate"
            value={filters.departureDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-md p-3 mx-2 min-w-64 text-black"
            disabled={!filters.destinationCity}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="class">
            <span className="text-white font-bold">Class</span>
          </label>
          <select
            name="class"
            id="class"
            value={filters.class}
            onChange={handleInputChange}
            className="rounded-md p-3 mx-2 min-w-64 text-black"
            disabled={!filters.departureDate}
          >
            <option value={TRAIN_CLASSES.ECONOMY}>Economy</option>
            <option value={TRAIN_CLASSES.BUSINESS}>Business</option>
            <option value={TRAIN_CLASSES.FIRST}>First Class</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={loadingTrains}
          className={`rounded-md p-3 mx-2 bg-primary-700 text-white font-bold 
            active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
            ${loadingTrains ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loadingTrains ? "Searching..." : "Search"}
        </button>
      </form>

      {loadingTrains && <LoadingSpinner />}

      {errorTrains && (
        <ErrorMessage
          message={
            errorTrains.message || "Failed to load trains. Please try again."
          }
        />
      )}

      {searchInitiated && !loadingTrains && !errorTrains && (
        <div className="train-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainsData?.data?.length > 0 ? (
            trainsData.data.map((train) => (
              <TrainCard
                key={train.id}
                train={train}
                onBookTicket={setSelectedTrain}
              />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-300">
              No trains found for the selected criteria. Please try different
              dates or destinations.
            </p>
          )}
        </div>
      )}

      {!searchInitiated && (
        <div className="text-center text-gray-300 mt-8">
          Search for available trains by selecting your journey details above.
        </div>
      )}
    </div>
  );
};

export default RailwaySystem;
