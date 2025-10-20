import axiosInstance from './axiosConfig';

const TOUR_BASE_URL = '/tour';

/**
 * Tour API Service
 * Handles all tour-related API calls
 */
export const tourApi = {
  // ============ PROVIDER DASHBOARD ============
  
  /**
   * Get provider dashboard data
   * @param {string} providerId - Provider ID
   * @returns {Promise} Dashboard data
   */
  getProviderDashboard: async (providerId) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/provider/${providerId}/dashboard`);
  },

  // ============ TOUR MANAGEMENT ============
  
  /**
   * Get all tours for a provider
   * @param {string} providerId - Provider ID
   * @param {object} filters - Filter parameters
   * @returns {Promise} List of tours
   */
  getProviderTours: async (providerId, filters = {}) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/provider/${providerId}/tours`, {
      params: filters
    });
  },

  /**
   * Get single tour details
   * @param {string} providerId - Provider ID
   * @param {string} tourId - Tour ID
   * @returns {Promise} Tour details
   */
  getTourDetails: async (providerId, tourId) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/provider/${providerId}/tours/${tourId}`);
  },

  /**
   * Create new tour
   * @param {string} providerId - Provider ID
   * @param {object} tourData - Tour data
   * @returns {Promise} Created tour
   */
  createTour: async (providerId, tourData) => {
    return await axiosInstance.post(`${TOUR_BASE_URL}/provider/${providerId}/tours`, tourData);
  },

  /**
   * Update existing tour
   * @param {string} providerId - Provider ID
   * @param {string} tourId - Tour ID
   * @param {object} tourData - Updated tour data
   * @returns {Promise} Updated tour
   */
  updateTour: async (providerId, tourId, tourData) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/provider/${providerId}/tours/${tourId}`, tourData);
  },

  /**
   * Delete tour
   * @param {string} providerId - Provider ID
   * @param {string} tourId - Tour ID
   * @returns {Promise} Deletion result
   */
  deleteTour: async (providerId, tourId) => {
    return await axiosInstance.delete(`${TOUR_BASE_URL}/provider/${providerId}/tours/${tourId}`);
  },

  /**
   * Update tour status
   * @param {string} providerId - Provider ID
   * @param {string} tourId - Tour ID
   * @param {string} status - New status
   * @returns {Promise} Updated tour
   */
  updateTourStatus: async (providerId, tourId, status) => {
    return await axiosInstance.patch(`${TOUR_BASE_URL}/provider/${providerId}/tours/${tourId}/status`, { status });
  },

  // ============ TOUR DATES MANAGEMENT ============
  
  /**
   * Add single tour date
   * @param {string} tourId - Tour ID
   * @param {object} dateData - Date data
   * @returns {Promise} Created date
   */
  addTourDate: async (tourId, dateData) => {
    return await axiosInstance.post(`${TOUR_BASE_URL}/${tourId}/dates`, dateData);
  },

  /**
   * Bulk add tour dates
   * @param {string} tourId - Tour ID
   * @param {object} bulkDateData - Bulk date data
   * @returns {Promise} Created dates
   */
  bulkAddTourDates: async (tourId, bulkDateData) => {
    return await axiosInstance.post(`${TOUR_BASE_URL}/${tourId}/dates/bulk`, bulkDateData);
  },

  /**
   * Get all dates for a tour
   * @param {string} tourId - Tour ID
   * @returns {Promise} List of dates
   */
  getTourDates: async (tourId) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/${tourId}/dates`);
  },

  /**
   * Get availability for a specific date
   * @param {string} tourId - Tour ID
   * @param {string} date - Date string
   * @returns {Promise} Availability data
   */
  getDateAvailability: async (tourId, date) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/${tourId}/dates/${date}/availability`);
  },

  /**
   * Update tour date
   * @param {string} tourId - Tour ID
   * @param {string} date - Date string
   * @param {object} dateData - Updated date data
   * @returns {Promise} Updated date
   */
  updateTourDate: async (tourId, date, dateData) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/${tourId}/dates/${date}`, dateData);
  },

  /**
   * Delete tour date
   * @param {string} tourId - Tour ID
   * @param {string} date - Date string
   * @returns {Promise} Deletion result
   */
  deleteTourDate: async (tourId, date) => {
    return await axiosInstance.delete(`${TOUR_BASE_URL}/${tourId}/dates/${date}`);
  },

  /**
   * Cancel tour date
   * @param {string} tourId - Tour ID
   * @param {string} date - Date string
   * @returns {Promise} Cancellation result
   */
  cancelTourDate: async (tourId, date) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/${tourId}/dates/${date}/cancel`);
  },

  /**
   * Search tours by date
   * @param {string} date - Date string
   * @returns {Promise} List of tours
   */
  searchToursByDate: async (date) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/search/by-date`, {
      params: { date }
    });
  },

  // ============ ITINERARY MANAGEMENT ============
  
  /**
   * Create itinerary
   * @param {string} tourId - Tour ID
   * @param {object} itineraryData - Itinerary data
   * @returns {Promise} Created itinerary
   */
  createItinerary: async (tourId, itineraryData) => {
    return await axiosInstance.post(`${TOUR_BASE_URL}/${tourId}/itineraries`, itineraryData);
  },

  /**
   * Get all itineraries for a tour
   * @param {string} tourId - Tour ID
   * @returns {Promise} List of itineraries
   */
  getItineraries: async (tourId) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/${tourId}/itineraries`);
  },

  /**
   * Get single itinerary
   * @param {string} itineraryId - Itinerary ID
   * @returns {Promise} Itinerary details
   */
  getItineraryDetails: async (itineraryId) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/itineraries/${itineraryId}`);
  },

  /**
   * Update itinerary
   * @param {string} itineraryId - Itinerary ID
   * @param {object} itineraryData - Updated itinerary data
   * @returns {Promise} Updated itinerary
   */
  updateItinerary: async (itineraryId, itineraryData) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/itineraries/${itineraryId}`, itineraryData);
  },

  /**
   * Delete itinerary
   * @param {string} itineraryId - Itinerary ID
   * @returns {Promise} Deletion result
   */
  deleteItinerary: async (itineraryId) => {
    return await axiosInstance.delete(`${TOUR_BASE_URL}/itineraries/${itineraryId}`);
  },

  // ============ ACTIVITY MANAGEMENT ============
  
  /**
   * Add activity to itinerary
   * @param {string} itineraryId - Itinerary ID
   * @param {object} activityData - Activity data
   * @returns {Promise} Created activity
   */
  addActivity: async (itineraryId, activityData) => {
    return await axiosInstance.post(`${TOUR_BASE_URL}/itineraries/${itineraryId}/activities`, activityData);
  },

  /**
   * Update activity
   * @param {string} itineraryId - Itinerary ID
   * @param {string} activityId - Activity ID
   * @param {object} activityData - Updated activity data
   * @returns {Promise} Updated activity
   */
  updateActivity: async (itineraryId, activityId, activityData) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/itineraries/${itineraryId}/activities/${activityId}`, activityData);
  },

  /**
   * Delete activity
   * @param {string} itineraryId - Itinerary ID
   * @param {string} activityId - Activity ID
   * @returns {Promise} Deletion result
   */
  deleteActivity: async (itineraryId, activityId) => {
    return await axiosInstance.delete(`${TOUR_BASE_URL}/itineraries/${itineraryId}/activities/${activityId}`);
  },

  // ============ BUDGET MANAGEMENT ============
  
  /**
   * Add budget item
   * @param {string} itineraryId - Itinerary ID
   * @param {object} budgetData - Budget item data
   * @returns {Promise} Created budget item
   */
  addBudgetItem: async (itineraryId, budgetData) => {
    return await axiosInstance.post(`${TOUR_BASE_URL}/itineraries/${itineraryId}/budget`, budgetData);
  },

  /**
   * Get budget breakdown
   * @param {string} itineraryId - Itinerary ID
   * @returns {Promise} Budget breakdown
   */
  getBudgetBreakdown: async (itineraryId) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/itineraries/${itineraryId}/budget`);
  },

  /**
   * Update budget item
   * @param {string} itineraryId - Itinerary ID
   * @param {string} budgetId - Budget item ID
   * @param {object} budgetData - Updated budget data
   * @returns {Promise} Updated budget item
   */
  updateBudgetItem: async (itineraryId, budgetId, budgetData) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/itineraries/${itineraryId}/budget/${budgetId}`, budgetData);
  },

  /**
   * Delete budget item
   * @param {string} itineraryId - Itinerary ID
   * @param {string} budgetId - Budget item ID
   * @returns {Promise} Deletion result
   */
  deleteBudgetItem: async (itineraryId, budgetId) => {
    return await axiosInstance.delete(`${TOUR_BASE_URL}/itineraries/${itineraryId}/budget/${budgetId}`);
  },

  // ============ BOOKING MANAGEMENT ============
  
  /**
   * Create booking
   * @param {object} bookingData - Booking data
   * @returns {Promise} Created booking
   */
  createBooking: async (bookingData) => {
    return await axiosInstance.post(`${TOUR_BASE_URL}/bookings`, bookingData);
  },

  /**
   * Get customer bookings
   * @returns {Promise} List of bookings
   */
  getMyBookings: async () => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/bookings/my-bookings`);
  },

  /**
   * Get booking details
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Booking details
   */
  getBookingDetails: async (bookingId) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/bookings/${bookingId}`);
  },

  /**
   * Get all provider bookings
   * @param {object} filters - Filter parameters
   * @returns {Promise} List of bookings
   */
  getProviderBookings: async (filters = {}) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/bookings/provider/all`, {
      params: filters
    });
  },

  /**
   * Confirm booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Updated booking
   */
  confirmBooking: async (bookingId) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/bookings/${bookingId}/confirm`);
  },

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @param {object} cancellationData - Cancellation reason and details
   * @returns {Promise} Updated booking
   */
  cancelBooking: async (bookingId, cancellationData) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/bookings/${bookingId}/cancel`, cancellationData);
  },

  /**
   * Complete booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Updated booking
   */
  completeBooking: async (bookingId) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/bookings/${bookingId}/complete`);
  },

  /**
   * Update payment status
   * @param {string} bookingId - Booking ID
   * @param {object} paymentData - Payment data
   * @returns {Promise} Updated booking
   */
  updatePayment: async (bookingId, paymentData) => {
    return await axiosInstance.put(`${TOUR_BASE_URL}/bookings/${bookingId}/payment`, paymentData);
  },

  /**
   * Get booking statistics
   * @returns {Promise} Booking stats
   */
  getBookingStats: async () => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/bookings/stats/summary`);
  },

  // ============ CUSTOMER TOUR SEARCH ============
  
  /**
   * Search tours
   * @param {object} searchParams - Search parameters
   * @returns {Promise} List of tours
   */
  searchTours: async (searchParams) => {
    return await axiosInstance.get(`${TOUR_BASE_URL}/search`, {
      params: searchParams
    });
  },

  // ============ AI ITINERARY (Server-assisted) ============

  /**
   * Generate itinerary using AI on the server
   * @param {string} tourId - Tour ID (optional)
   * @param {object} aiInput - AI input payload (preferences, days, budget, travelers, etc.)
   * @returns {Promise} Generated itinerary data
   */
  generateItineraryAI: async (tourId, aiInput = {}) => {
    // Using a dedicated AI endpoint; axiosInstance already prefixes with /api base
    return await axiosInstance.post(`/ai/itinerary`, { tourId, ...aiInput });
  },

  /**
   * Create an AI itinerary request record (store user request)
   * @param {object} requestData - full request payload matching AI_REQUEST schema
   * @returns {Promise} created request
   */
  createAiItineraryRequest: async (requestData) => {
    return await axiosInstance.post(`/ai/requests`, requestData);
  },
};

export default tourApi;
