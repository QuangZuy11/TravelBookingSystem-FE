import axios from 'axios';

const API_BASE_URL = '/api/flight';

const flightBookingService = {
    // Get all bookings for a flight
    getFlightBookings: async (flightId, params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/flights/${flightId}/bookings`, { params });
        return response.data;
    },

    // Get all bookings for a user
    getUserBookings: async (userId, params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/bookings`, { params });
        return response.data;
    },

    // Get all bookings for provider
    getProviderBookings: async (providerId, params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/provider/${providerId}/bookings`, { params });
        return response.data;
    },

    // Get a specific booking
    getBookingById: async (bookingId) => {
        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
        return response.data;
    },

    // Create a new booking
    createBooking: async (userId, bookingData) => {
        const response = await axios.post(`${API_BASE_URL}/users/${userId}/bookings`, bookingData);
        return response.data;
    },

    // Cancel a booking
    cancelBooking: async (bookingId, reason) => {
        const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, { reason });
        return response.data;
    },

    // Update booking status
    updateBookingStatus: async (bookingId, status) => {
        const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, { status });
        return response.data;
    },

    // Get booking statistics
    getBookingStatistics: async (providerId) => {
        const response = await axios.get(`${API_BASE_URL}/provider/${providerId}/booking-statistics`);
        return response.data;
    }
};

export default flightBookingService;