import React, { useState } from "react";
import axios from "axios";
import { API } from "../utils/api";

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [trainId, setTrainId] = useState("");
  const [passengerId, setPassengerId] = useState("");
  const [date, setDate] = useState("");

  // Function to fetch data
  const fetchData = async (endpoint, params = {}) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await axios.get(`${API}${endpoint}`, { params });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen my-20 bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-primary-700 mb-4">
        Reports Dashboard
      </h1>

      {/* Input Fields */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          value={trainId}
          onChange={(e) => setTrainId(e.target.value)}
          placeholder="Enter Train ID"
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <input
          type="text"
          value={passengerId}
          onChange={(e) => setPassengerId(e.target.value)}
          placeholder="Enter Passenger ID"
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>

      {/* Buttons for fetching data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => fetchData("/v1/reports/active-trains")}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded shadow"
        >
          Fetch Active Trains
        </button>

        <button
          onClick={() =>
            fetchData(`/v1/reports/stations/${trainId}`, { trainId })
          }
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded shadow"
        >
          Fetch Train Stations
        </button>

        <button
          onClick={() =>
            fetchData(`/v1/reports/reservations/${passengerId}`, {
              passengerId,
            })
          }
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded shadow"
        >
          Fetch Reservations
        </button>

        <button
          onClick={() =>
            fetchData(`/v1/reports/waitlisted-loyalty/${trainId}`, { trainId })
          }
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded shadow"
        >
          Fetch Waitlisted Loyalty
        </button>

        <button
          onClick={() => fetchData("/v1/reports/load-factor", { date })}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded shadow"
        >
          Fetch Load Factor
        </button>

        <button
          onClick={() => fetchData("/v1/reports/dependents", { date })}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded shadow"
        >
          Fetch Dependents
        </button>
      </div>

      {/* Data Display */}
      <div className="mt-8">
        {loading && <p className="text-primary-700">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {data && data.success && data.data && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold text-primary-700 mb-4">Results</h2>
            {Array.isArray(data.data) ? (
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    {Object.keys(data.data[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="border px-4 py-2 text-left text-sm font-bold text-gray-700"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((row, index) => (
                    <tr key={index} className="border-t">
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="border px-4 py-2 text-sm text-gray-600"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : data.data.trains ? (
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    {Object.keys(data.data.trains[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="border px-4 py-2 text-left text-sm font-bold text-gray-700"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.trains.map((row, index) => (
                    <tr key={index} className="border-t">
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="border px-4 py-2 text-sm text-gray-600"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
