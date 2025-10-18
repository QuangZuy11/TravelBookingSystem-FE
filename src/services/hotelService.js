import apiClient from '../config/apiClient';

const hotelService = {
  // Get all hotels for a provider
  getProviderHotels: (providerId, params) => {
    return apiClient.get(`/hotel/provider/${providerId}/hotels`, { params });
  },

  // Get single hotel details
  getHotelById: (providerId, hotelId) => {
    return apiClient.get(`/hotel/provider/${providerId}/hotels/${hotelId}`);
  },

  // Create new hotel
  createHotel: (providerId, hotelData) => {
    return apiClient.post(`/hotel/provider/${providerId}/hotels`, hotelData);
  },

  // Update hotel
  updateHotel: (providerId, hotelId, hotelData) => {
    return apiClient.put(`/hotel/provider/${providerId}/hotels/${hotelId}`, hotelData);
  },

  // Delete hotel
  deleteHotel: (providerId, hotelId) => {
    return apiClient.delete(`/hotel/provider/${providerId}/hotels/${hotelId}`);
  },

  // Get hotel statistics
  getHotelStats: (providerId) => {
    return apiClient.get(`/hotel/provider/${providerId}/statistics`);
  },

  // Room management
  getRooms: (hotelId, params) => {
    return apiClient.get(`/hotel/hotels/${hotelId}/rooms`, { params });
  },

  getRoomById: (hotelId, roomId) => {
    return apiClient.get(`/hotel/hotels/${hotelId}/rooms/${roomId}`);
  },

  createRoom: (hotelId, roomData) => {
    return apiClient.post(`/hotel/hotels/${hotelId}/rooms`, roomData);
  },

  updateRoom: (hotelId, roomId, roomData) => {
    return apiClient.put(`/hotel/hotels/${hotelId}/rooms/${roomId}`, roomData);
  },

  deleteRoom: (hotelId, roomId) => {
    return apiClient.delete(`/hotel/hotels/${hotelId}/rooms/${roomId}`);
  },

  // Booking management
  getHotelBookings: (providerId, params) => {
    return apiClient.get(`/hotel/provider/${providerId}/bookings`, { params });
  },

  getBookingById: (providerId, bookingId) => {
    return apiClient.get(`/hotel/provider/${providerId}/bookings/${bookingId}`);
  },

  updateBookingStatus: (providerId, bookingId, status) => {
    return apiClient.put(`/hotel/provider/${providerId}/bookings/${bookingId}/status`, { status });
  },
};

export default hotelService;
