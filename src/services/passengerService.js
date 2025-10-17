import axios from 'axios';

const API_BASE_URL = '/api';

const passengerService = {
    // Get all passengers for a booking
    getBookingPassengers: async (bookingId) => {
        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}/passengers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        return response.data;
    },

    // Get a specific passenger
    getPassengerById: async (bookingId, passengerId) => {
        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}/passengers/${passengerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        return response.data;
    },

    // Add a new passenger to booking
    addPassenger: async (bookingId, passengerData) => {
        const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/passengers`, passengerData);
        return response.data;
    },

    // Add multiple passengers to booking
    addMultiplePassengers: async (bookingId, passengersData) => {
        const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/passengers/bulk`, { passengers: passengersData });
        return response.data;
    },

    // Update passenger information
    updatePassenger: async (bookingId, passengerId, passengerData) => {
        const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/passengers/${passengerId}`, passengerData,
                { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },

    // Delete a passenger from booking
    deletePassenger: async (bookingId, passengerId) => {
        const response = await axios.delete(`${API_BASE_URL}/bookings/${bookingId}/passengers/${passengerId}`);
        return response.data;
    }
};

export default passengerService;