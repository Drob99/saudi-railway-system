import axios from "axios";
import { AlertCircle, Check, Edit2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { API } from "../utils/api";
import UpdateReservationDialog from "./UpdateReservationDialog";
import Tooltip from "./ui/ToolTip";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// Helper Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
  </div>
);

const ReservationsTable = ({
  reservations,
  onEdit,
  onDelete,
  onPromoteWaitlist,
  cities,
}) => {
  const getCityName = (cityId) => {
    const city = cities?.find((city) => city.cityid === cityId);
    return city ? `${city.name} (${city.region})` : `City ${cityId}`;
  };
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Booking ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Passenger Info
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Trip Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Seat & Class
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Payment Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reservations.map((reservation) => (
            <tr key={reservation.bookingid} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{reservation.bookingid}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {reservation.passengerfullname}
                  </span>
                  <span>Passenger ID: {reservation.passengerid}</span>
                  {reservation.dependentid && (
                    <span className="text-xs text-gray-400">
                      Dependent ID: {reservation.dependentid}
                    </span>
                  )}
                  {reservation.dependents &&
                    reservation.dependents.length > 0 && (
                      <span className="text-xs text-gray-400">
                        Dependents: {reservation.dependents.join(", ")}
                      </span>
                    )}
                  <span className="text-xs text-gray-400">
                    Luggage: {reservation.numofluggage} pieces
                  </span>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-col">
                  <span>Train: {reservation.trainid}</span>
                  <span className="text-xs text-gray-400">
                    {getCityName(reservation.originstationid)} →{" "}
                    {getCityName(reservation.destinationstationid)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(reservation.date).toLocaleDateString()}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-col">
                  <span>Seat: {reservation.seatnumber}</span>
                  <span className="text-xs">{reservation.class}</span>
                  <span className="text-xs text-gray-400">
                    SAR {parseFloat(reservation.basefare).toFixed(2)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                ${
                  reservation.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : reservation.status === "Waiting"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
                >
                  {reservation.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${
                    reservation.paymentstatus === "Completed"
                      ? "bg-green-100 text-green-800"
                      : reservation.paymentstatus === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {reservation.paymentstatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(reservation)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(reservation)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {reservation.status === "Waiting" && (
                    <Tooltip content={"Promote"}>
                      <button
                        onClick={() => onPromoteWaitlist(reservation)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FilterSection = ({ filters, onFilterChange, cities }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:text-gray-500 w-full block"
        >
          <option value="">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Waiting">Waiting</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => onFilterChange("date", e.target.value)}
          className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-gray-100 disabled:text-gray-500 w-full block"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Origin
        </label>
        <select
          value={filters.originCity}
          onChange={(e) => onFilterChange("originCity", e.target.value)}
          className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                   disabled:bg-gray-100 disabled:text-gray-500 w-full block"
        >
          <option value="">All Origins</option>
          {cities?.map((city) => (
            <option key={city.cityid} value={city.cityid}>
              {city.name} ({city.region})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Destination
        </label>
        <select
          value={filters.destinationCity}
          onChange={(e) => onFilterChange("destinationCity", e.target.value)}
          className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                   disabled:bg-gray-100 disabled:text-gray-500 w-full block"
        >
          <option value="">All Destinations</option>
          {cities?.map((city) => (
            <option key={city.cityid} value={city.cityid}>
              {city.name} ({city.region})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by ID..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange("searchTerm", e.target.value)}
          className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-gray-100 disabled:text-gray-500 w-full block"
        />
      </div>
      <div className="flex items-end">
        <button
          onClick={() => onFilterChange("reset")}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 
                   rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  </div>
);

const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  reservation,
  onConfirm,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          Confirm Deletion
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Are you sure you want to delete this reservation?</p>
        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone. Booking #{reservation?.bookingid}
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            onConfirm(reservation);
            onOpenChange(false);
          }}
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const StaffReservations = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    status: "",
    date: "",
    searchTerm: "",
  });
  // Add cities query
  const { data: citiesData, isLoading: loadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/v1/cities`);
      return data;
    },
  });

  const promoteWaitlistMutation = useMutation({
    mutationFn: async ({ bookingId, newSeatNumber }) => {
      const { data } = await axios.post(`${API}/v1/admin/promote-waitlist`, {
        bookingId,
        newSeatNumber,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: (error) => {
      console.error("Failed to promote waitlist:", error);
      // TODO: Add error handling toast or notification
    },
  });

  const handlePromoteWaitlist = (reservation) => {
    // For this example, we'll automatically assign the next seat number
    // In a real application, you might want to prompt the user or have a more sophisticated seat selection
    const newSeatNumber = reservation.seatnumber + 1;

    promoteWaitlistMutation.mutate({
      bookingId: reservation.bookingid,
      newSeatNumber,
    });
  };

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    reservation: null,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    reservation: null,
  });
  const queryClient = useQueryClient();

  // Fetch reservations
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reservations", filters],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/v1/rand/getAllReservations/`, {
        params: filters,
      });
      return data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (reservationId) => {
      await axios.delete(`${API}/v1/booking/cancel/${reservationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
    },
  });

  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      setFilters({
        page: 1,
        limit: 5,
        status: "",
        date: "",
        searchTerm: "",
      });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
      refetch();
    }
  };

  const handleDelete = (reservation) => {
    setDeleteDialog({ open: true, reservation });
  };

  const handleEdit = (reservation) => {
    setEditDialog({ open: true, reservation });
  };

  const confirmDelete = async (reservation) => {
    try {
      await deleteMutation.mutateAsync(reservation.bookingid);
    } catch (error) {
      console.error("Failed to delete reservation:", error);
    }
  };

  return (
    <div className="max-w-7xl my-20 mx-auto py-6 px-4 sm:px-6 bg-gray-50 rounded-md lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Reservations Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage all reservations in the system
        </p>
      </div>

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        cities={citiesData?.cities}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ReservationsTable
            reservations={data?.reservations || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPromoteWaitlist={handlePromoteWaitlist}
            cities={citiesData?.cities}
          />

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-700">
              Showing page {filters.page} of{" "}
              {Math.ceil((data?.total || 0) / filters.limit)}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange("page", filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange("page", filters.page + 1)}
                disabled={
                  !data?.reservations ||
                  data.reservations.length < filters.limit
                }
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <UpdateReservationDialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog((prev) => ({
            ...prev,
            open,
          }))
        }
        reservation={editDialog.reservation}
        cities={citiesData?.cities}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        reservation={deleteDialog.reservation}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default StaffReservations;
