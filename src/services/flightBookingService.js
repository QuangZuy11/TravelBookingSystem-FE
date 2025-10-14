import axios from 'axios';

const API_BASE_URL = '/api/flight';

const token = localStorage.getItem('token');
const flightBookingService = {
    // Get all bookings for a flight
    getFlightBookings: async (flightId, params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/flights/${flightId}/bookings`, { params, headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },

    // Get all bookings for a user
    getUserBookings: async (userId, params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/bookings`, { params, headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },

    // Get all bookings for provider
    getProviderBookings: async (providerId, params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/provider/${providerId}/bookings`, { params, headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },

    // Get a specific booking
    getBookingById: async (bookingId) => {
        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },

    // Create a new booking
    createBooking: async (userId, bookingData) => {
        const response = await axios.post(`${API_BASE_URL}/users/${userId}/bookings`, bookingData, {
                headers: { Authorization: `Bearer ${token}` }
            });
        return response.data;
    },

    // Cancel a booking
    cancelBooking: async (bookingId, reason) => {
        const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        return response.data;
    },

    // Update booking status
    updateBookingStatus: async (bookingId, status) => {
        const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        return response.data;
    },

    // Get booking statistics
    getBookingStatistics: async (providerId) => {
        const response = await axios.get(`${API_BASE_URL}/provider/${providerId}/booking-statistics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        return response.data;
    }
};

export default flightBookingService;