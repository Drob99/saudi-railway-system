import React, { useState } from "react";
import trainLogo from "../images/trainLogo.png";
import { useQuery } from "react-query";
import axios from "axios";
import { API } from "../utils/api";
import { useStaffBooking } from "./StaffBookingContext";

const TRAIN_CLASSES = {
  ECONOMY: "Economy",
  BUSINESS: "Business",
  FIRST: "First",
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center h-64 text-red-600 bg-red-50 rounded-lg p-4">
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
  <div className="flex flex-col w-full overflow-hidden">
    <label htmlFor={name} className="block mb-2 w-full">
      <span className="text-gray-900 font-semibold">{label}</span>
    </label>
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:text-gray-500 w-full block"
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

const TrainCard = ({ train, onSelect, selectedTrainId }) => {
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

  const isSelected = selectedTrainId === train.tripid;

  return (
    <div
      className={`
        motion-preset-slide-up-md p-6 rounded-lg shadow-md hover:shadow-lg 
        transition-all cursor-pointer border
        ${
          isSelected
            ? "bg-primary-50 border-primary-500"
            : "bg-white border-gray-200 hover:border-primary-300"
        }
      `}
      onClick={() => onSelect(train)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={trainLogo} alt="" className="w-10 h-10" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {train.trainnameenglish}
            </h3>
            <p className="text-gray-600">{train.trainnamearabic}</p>
          </div>
        </div>
        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
          {train.availableseats} seats left
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Departure</p>
            <p className="font-medium text-gray-900">
              {formatTime(train.departuretime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Arrival</p>
            <p className="font-medium text-gray-900">
              {formatTime(train.arrivaltime)}
            </p>
          </div>
        </div>

        <div className="text-center bg-gray-50 py-2 rounded-md">
          <p className="text-sm text-gray-700">
            {formatDate(train.departuretime)}
          </p>
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-lg font-bold text-gray-900">
            SAR {parseFloat(train.ticketprice).toFixed(2)}
          </p>
          {isSelected && (
            <span className="text-primary-700 font-medium">Selected</span>
          )}
        </div>
      </div>
    </div>
  );
};

const StaffTripSelection = () => {
  const [filters, setFilters] = useState({
    originCity: "",
    destinationCity: "",
    departureDate: "",
    class: TRAIN_CLASSES.ECONOMY,
  });
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const { proceedToNextStep, setSelectedTrip } = useStaffBooking();

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
    data: trainsData,
    isLoading: loadingTrains,
    error: errorTrains,
    refetch: searchTrains,
  } = useQuery({
    queryKey: ["trains", filters],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/v1/trains/search`, {
        params: filters,
      });
      return data;
    },
    enabled: false,
  });

  const handleTrainSelect = (train) => {
    // Update local state
    setSelectedTrain(train);

    // Update context with trip details including class
    setSelectedTrip({
      ...train,
      class: filters.class,
      originCity: filters.originCity,
      destinationCity: filters.destinationCity,
      departureDate: filters.departureDate,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "departureDate") {
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
    setSearchInitiated(false);
    setSelectedTrain(null);
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

  if (loadingCities) return <LoadingSpinner />;
  if (errorCities) return <ErrorMessage message="Failed to load cities" />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Select Trip for Customer
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <label className="block mb-2">
                <span className="text-gray-900 font-semibold">Date</span>
              </label>
              <input
                type="date"
                name="departureDate"
                value={filters.departureDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        disabled:bg-gray-100 disabled:text-gray-500"
                disabled={!filters.destinationCity}
              />
            </div>

            <div className="flex flex-col">
              <label className="block mb-2">
                <span className="text-gray-900 font-semibold">Class</span>
              </label>
              <select
                name="class"
                value={filters.class}
                onChange={handleInputChange}
                className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={TRAIN_CLASSES.ECONOMY}>Economy</option>
                <option value={TRAIN_CLASSES.BUSINESS}>Business</option>
                <option value={TRAIN_CLASSES.FIRST}>First Class</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loadingTrains}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg
                     hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingTrains ? "Searching..." : "Search Trips"}
            </button>
          </div>
        </form>
      </div>

      {loadingTrains && <LoadingSpinner />}
      {errorTrains && <ErrorMessage message="Failed to load trains" />}

      {searchInitiated && !loadingTrains && !errorTrains && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainsData?.data?.length > 0 ? (
              trainsData.data.map((train) => (
                <TrainCard
                  key={train.tripid}
                  train={train}
                  onSelect={handleTrainSelect}
                  selectedTrainId={selectedTrain?.tripid}
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center bg-gray-50 rounded-lg p-8 border border-gray-200">
                  <p className="text-gray-600">
                    No trains found for the selected criteria.
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedTrain && (
            <div className="fixed bottom-6 right-6">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Selected Trip:</p>
                    <p className="text-gray-600">
                      {selectedTrain.trainnameenglish} - {filters.class}
                    </p>
                  </div>
                  <button
                    onClick={proceedToNextStep}
                    className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg
                           hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 
                           focus:ring-primary-500 transition-colors"
                  >
                    Continue to Passenger Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!searchInitiated && (
        <div className="text-center bg-gray-50 rounded-lg p-8 border border-gray-200">
          <p className="text-gray-600">
            Search for available trains by selecting journey details above.
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffTripSelection;
