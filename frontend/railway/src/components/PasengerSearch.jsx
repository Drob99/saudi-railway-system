import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import debounce from "lodash/debounce";
import { API } from "../utils/api";
import { useStaffBooking } from "./StaffBookingContext";

const PassengerSearch = () => {
  const { selectedPassenger, setSelectedPassenger, proceedToNextStep } =
    useStaffBooking();

  const [filters, setFilters] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    identificationdoc: "",
    personid: "",
  });
  const [page, setPage] = useState(1);

  const limit = 2;

  // Fetch passengers with filters and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ["passengers", filters, page],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
        page: page.toString(),
        limit: limit.toString(),
      });

      const { data } = await axios.get(
        `${API}/v1/rand/getAllPassengers?${queryParams}`
      );
      return data;
    },
    keepPreviousData: true,
  });

  // Debounced filter handler
  const updateFilters = debounce((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page on filter change
  }, 300);

  const handlePassengerSelect = (passenger) => {
    setSelectedPassenger(passenger);
  };

  const handleContinue = () => {
    proceedToNextStep();
  };

  return (
    <div className="w-full bg-gray-100 my-20 rounded-md mx-auto p-6 motion-preset-slide-up-sm">
      {/* Search Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Passenger Search
        </h2>
        <p className="text-gray-600">
          Search for passengers using any of the fields below
        </p>
      </div>

      {/* Filter Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            placeholder="First name"
            onChange={(e) => updateFilters("fname", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Last name"
            onChange={(e) => updateFilters("lname", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => updateFilters("email", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            placeholder="Phone number"
            onChange={(e) => updateFilters("phone", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Document
          </label>
          <input
            type="text"
            placeholder="ID number"
            onChange={(e) => updateFilters("identificationdoc", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Person ID
          </label>
          <input
            type="text"
            placeholder="Person ID"
            onChange={(e) => updateFilters("personid", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-red-600 p-4 rounded-lg bg-red-50 mb-4">
          Error loading passengers: {error.message}
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {data?.passengers.map((passenger) => (
            <div
              key={passenger.personid}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors
              ${
                selectedPassenger?.personid === passenger.personid
                  ? "bg-primary-50"
                  : ""
              }
            `}
              onClick={() => handlePassengerSelect(passenger)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {passenger.fname}{" "}
                    {passenger.minit ? `${passenger.minit}. ` : ""}
                    {passenger.lname}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    <p>Email: {passenger.email}</p>
                    <p>Phone: {passenger.phone}</p>
                    <p>ID: {passenger.identificationdoc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-primary-600">
                    Loyalty Points: {passenger.loyaltykilometers}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {data?.passengers.length === 0 && !isLoading && (
            <div className="p-8 text-center text-gray-500">
              No passengers found matching your search criteria
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={data?.passengers.length < limit}
          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Selection Action */}
      {selectedPassenger && (
        <div className="fixed top-6 right-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">
                {selectedPassenger.fname} {selectedPassenger.lname}
              </p>
              <p className="text-gray-500">{selectedPassenger.email}</p>
            </div>
            <button
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
              onClick={handleContinue}
            >
              Continue to Seat Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerSearch;
