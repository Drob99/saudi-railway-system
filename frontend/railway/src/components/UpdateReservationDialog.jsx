import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { API } from '../utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Edit2 } from 'lucide-react';

const UpdateReservationDialog = ({ 
  open, 
  onOpenChange, 
  reservation, 
  cities 
}) => {
  const [editedReservation, setEditedReservation] = useState({
    class: '',
    seatNumber: '',
    baseFare: '',
    numOfLuggage: '',
    dependentId: null
  });

  const queryClient = useQueryClient();

  // Reset form when reservation changes
  useEffect(() => {
    if (reservation) {
      setEditedReservation({
        class: reservation.class || '',
        seatNumber: reservation.seatnumber || '',
        baseFare: reservation.basefare || '',
        numOfLuggage: reservation.numofluggage || '',
        dependentId: reservation.dependentid || null
      });
    }
  }, [reservation]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedReservation) => {
      const { data } = await axios.put(
        `${API}/v1/booking/update/${reservation.bookingid}`, 
        updatedReservation
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to update reservation:', error);
      // TODO: Add error handling toast or notification
    }
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReservation(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields and handle null for dependent ID
    const submissionData = {
      ...editedReservation,
      seatNumber: Number(editedReservation.seatNumber),
      baseFare: Number(editedReservation.baseFare),
      numOfLuggage: Number(editedReservation.numOfLuggage),
      dependentId: editedReservation.dependentId === '' ? null : editedReservation.dependentId
    };

    updateMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Update Reservation #{reservation?.bookingid}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Class
              </label>
              <select
                name="class"
                value={editedReservation.class}
                onChange={handleInputChange}
      className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:text-gray-500 w-full block"              >
                <option value="">Select Class</option>
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Seat Number
              </label>
              <input
                type="number"
                name="seatNumber"
                value={editedReservation.seatNumber}
                onChange={handleInputChange}
      className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:text-gray-500 w-full block"              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Base Fare (SAR)
              </label>
              <input
                type="number"
                name="baseFare"
                step="0.01"
                value={editedReservation.baseFare}
                onChange={handleInputChange}
      className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:text-gray-500 w-full block"              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Luggage
              </label>
              <input
                type="number"
                name="numOfLuggage"
                value={editedReservation.numOfLuggage}
                onChange={handleInputChange}
      className="rounded-lg p-3 text-gray-900 bg-white border border-gray-300
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:text-gray-500 w-full block"              />
            </div>
          </div>


          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Reservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateReservationDialog;