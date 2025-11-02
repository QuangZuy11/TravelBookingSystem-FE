/**
 * AI Itinerary Service - Updated for New API Reference
 * Backend API: /api/ai-itineraries/*
 * Spec: docs/COMPLETE_API_REFERENCE.md
 */

import apiClient from '../config/apiClient';

const AI_ITINERARY_BASE = '/ai-itineraries';

/**
 * 🎯 Generate AI Itinerary
 * @param {Object} request - Itinerary generation request
 * @param {string} request.destination - Destination name (required, e.g. "Ninh Bình")
 * @param {number} request.duration_days - Number of days (required, 1-14)
 * @param {number} request.participant_number - Number of travelers (required)
 * @param {number} request.budget - Budget amount in VND (optional)
 * @param {string} request.budget_level - Budget level: 'low' | 'medium' | 'high' (optional)
 * @param {string} request.age_range - Age range (optional, e.g. "25-35")
 * @param {string[]} request.preferences - User preferences array (required, min 2)
 * @returns {Promise} Response with complete itinerary structure
 */
export const generateAIItinerary = async (request) => {
  try {
    const response = await apiClient.post(`${AI_ITINERARY_BASE}/generate`, request, {
      timeout: 60000, // 60 seconds for AI processing
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ AI Itinerary Generation Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to generate itinerary',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * 📋 Get User's AI Itineraries
 * @param {string} userId - User's ObjectId
 * @returns {Promise} Response with user's requests and itineraries (both original & customized)
 */
export const getUserItineraries = async (userId) => {
  try {
    const response = await apiClient.get(`${AI_ITINERARY_BASE}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get User Itineraries Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to fetch user itineraries',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * 👀 Get AI Itinerary Details
 * @param {string} aiGeneratedId - AI Generated Itinerary ID
 * @returns {Promise} Response with both original and customized versions if available
 */
export const getItineraryById = async (aiGeneratedId, options = {}) => {
  try {
    const response = await apiClient.get(`${AI_ITINERARY_BASE}/${aiGeneratedId}`, options);
    return response.data;
  } catch (error) {
    console.error('❌ Get Itinerary Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to fetch itinerary',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Get User's Requests
 * @param {string} userId - User's ObjectId
 * @returns {Promise} Response with user's request history (without itinerary data)
 */
export const getUserRequests = async (userId) => {
  try {
    const response = await apiClient.get(`${AI_ITINERARY_BASE}/requests/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get User Requests Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to fetch user requests',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * 🗑️ Delete AI Itinerary
 * @param {string} aiGeneratedId - AI Generated Itinerary ID
 * @returns {Promise} Response confirming deletion (removes both AI record and associated itineraries)
 */
export const deleteItinerary = async (aiGeneratedId) => {
  try {
    const response = await apiClient.delete(`${AI_ITINERARY_BASE}/${aiGeneratedId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete Itinerary Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to delete itinerary',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Update Itinerary Day
 * @param {string} itineraryDayId - Itinerary Day ObjectId
 * @param {Object} updates - Updates to apply
 * @param {string} updates.title - Day title (optional)
 * @param {string} updates.description - Day description (optional)
 * @returns {Promise} Response with updated day data
 */
export const updateItineraryDay = async (itineraryDayId, updates) => {
  try {
    const response = await apiClient.put(`${AI_ITINERARY_BASE}/day/${itineraryDayId}`, updates);
    return response.data;
  } catch (error) {
    console.error('❌ Update Itinerary Day Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to update itinerary day',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Update Activity
 * @param {string} activityId - Activity ObjectId
 * @param {Object} updates - Updates to apply (all fields optional)
 * @param {string} updates.activity_name - Activity name
 * @param {string} updates.start_time - Start time (e.g. "10:00")
 * @param {string} updates.end_time - End time (e.g. "13:00")
 * @param {number} updates.duration_hours - Duration in hours
 * @param {string} updates.description - Activity description
 * @param {number} updates.cost - Activity cost in VND
 * @param {boolean} updates.optional - Whether activity is optional
 * @returns {Promise} Response with updated activity data
 */
export const updateActivity = async (activityId, updates) => {
  try {
    const response = await apiClient.put(`${AI_ITINERARY_BASE}/activity/${activityId}`, updates);
    return response.data;
  } catch (error) {
    console.error('❌ Update Activity Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to update activity',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Add Activity to Day
 * @param {string} itineraryDayId - Itinerary Day ObjectId
 * @param {Object} activityData - New activity data
 * @param {string} activityData.poi_id - POI ObjectId
 * @param {string} activityData.activity_name - Activity name
 * @param {string} activityData.start_time - Start time (e.g. "12:00")
 * @param {string} activityData.end_time - End time (e.g. "13:00")
 * @param {number} activityData.duration_hours - Duration in hours
 * @param {string} activityData.description - Activity description
 * @param {number} activityData.cost - Activity cost in VND
 * @param {boolean} activityData.optional - Whether activity is optional (default: true)
 * @returns {Promise} Response with new activity data
 */
export const addActivityToDay = async (itineraryDayId, activityData) => {
  try {
    const response = await apiClient.post(`${AI_ITINERARY_BASE}/day/${itineraryDayId}/activities`, activityData);
    return response.data;
  } catch (error) {
    console.error('❌ Add Activity Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to add activity',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Delete Activity
 * @param {string} activityId - Activity ObjectId
 * @returns {Promise} Response confirming deletion
 */
export const deleteActivity = async (activityId) => {
  try {
    const response = await apiClient.delete(`${AI_ITINERARY_BASE}/activity/${activityId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete Activity Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to delete activity',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Reorder Activities in Day
 * @param {string} itineraryDayId - Itinerary Day ObjectId
 * @param {string[]} activityIds - Array of activity IDs in new order
 * @returns {Promise} Response with updated day data
 */
export const reorderActivities = async (itineraryDayId, activityIds) => {
  try {
    const response = await apiClient.put(`${AI_ITINERARY_BASE}/day/${itineraryDayId}/reorder`, {
      activityIds
    });
    return response.data;
  } catch (error) {
    console.error('❌ Reorder Activities Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to reorder activities',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * ✏️ Get Customizable AI Itinerary (Initialize if needed)
 * @param {string} aiGeneratedId - Original AI Generated Itinerary ID
 * @returns {Promise} Response with customizable version (creates if doesn't exist)
 */
export const getCustomizableItinerary = async (aiGeneratedId) => {
  try {
    const response = await apiClient.get(`${AI_ITINERARY_BASE}/${aiGeneratedId}/customize`);
    return response.data;
  } catch (error) {
    console.error('❌ Get Customizable Itinerary Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to get customizable itinerary',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * 💾 Update Customized Itinerary (Auto-save)
 * @param {string} aiGeneratedId - AI Generated Itinerary ID (customized version)
 * @param {Object} updateData - Updated itinerary data with auto-save support
 * @param {string} updateData.summary - Updated summary (optional)
 * @param {Array} updateData.itinerary_data - Updated days array with activities
 * @returns {Promise} Response with updated customized itinerary
 */
export const updateCustomizedItinerary = async (aiGeneratedId, updateData) => {
  try {
    const response = await apiClient.put(`${AI_ITINERARY_BASE}/${aiGeneratedId}/customize`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Update Customized Itinerary Error:', error);
    throw {
      message: error.response?.data?.message || 'Failed to update customized itinerary',
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Get available destinations from backend
 * @returns {Promise} Array of destinations with _id, name, country, etc.
 */
export const getDestinations = async () => {
  try {
    const response = await apiClient.get('/destinations');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('❌ Get Destinations Error:', error);
    // Return mock data as fallback if API fails
    console.warn('⚠️ Using mock destination data as fallback');
    return [
      {
        _id: '1',
        name: 'Hanoi',
        country: 'Vietnam',
        description: 'Capital of Vietnam with rich history and culture',
        type: 'city',
        location: { city: 'Hanoi', country: 'Vietnam' }
      },
      {
        _id: '2',
        name: 'Da Nang',
        country: 'Vietnam',
        description: 'Coastal city with beautiful beaches',
        type: 'city',
        location: { city: 'Da Nang', country: 'Vietnam' }
      },
      {
        _id: '3',
        name: 'Ho Chi Minh City',
        country: 'Vietnam',
        description: 'Largest city with vibrant energy',
        type: 'city',
        location: { city: 'Ho Chi Minh City', country: 'Vietnam' }
      },
      {
        _id: '4',
        name: 'Hoi An',
        country: 'Vietnam',
        description: 'Ancient town with UNESCO World Heritage site',
        type: 'city',
        location: { city: 'Hoi An', country: 'Vietnam' }
      },
      {
        _id: '5',
        name: 'Hue',
        country: 'Vietnam',
        description: 'Former imperial capital',
        type: 'city',
        location: { city: 'Hue', country: 'Vietnam' }
      }
    ];
  }
};

/**
 * 🎨 Enhanced UI Configuration Options
 */
export const PREFERENCE_OPTIONS = [
  { id: 'culture', label: 'Culture', icon: '🎭', gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)' },
  { id: 'history', label: 'History', icon: '🏛️', gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' },
  { id: 'food', label: 'Food', icon: '🍜', gradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)' },
  { id: 'nature', label: 'Nature', icon: '🌿', gradient: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)' },
  { id: 'adventure', label: 'Adventure', icon: '🏔️', gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎪', gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' },
  { id: 'relaxation', label: 'Relaxation', icon: '🧘', gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)' }
];

export const BUDGET_OPTIONS = [
  {
    value: 'low',
    label: 'Budget',
    emoji: '💰',
    title: 'Budget',
    description: 'Affordable adventures',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  },
  {
    value: 'medium',
    label: 'Moderate',
    emoji: '⚖️',
    title: 'Moderate',
    description: 'Balanced comfort',
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
  },
  {
    value: 'high',
    label: 'Luxury',
    emoji: '💎',
    title: 'Luxury',
    description: 'Premium experiences',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
  }
];

/**
 * 🔧 Utility Functions for Error Handling
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;

  // Handle specific error types
  if (error.response?.status === 401) {
    return { message: 'Authentication required. Please login again.', shouldRedirect: true };
  } else if (error.response?.status === 404) {
    return { message: 'Resource not found. It may have been deleted.', shouldRedirect: false };
  } else if (error.response?.status >= 500) {
    return { message: 'Server error. Please try again later.', shouldRedirect: false };
  }

  return { message: errorMessage, shouldRedirect: false };
};

// 🎯 UNIFIED ARCHITECTURE: Tour Itinerary APIs  
export const createTourItinerary = async (tourId, itineraryData) => {
  try {
    // Add required fields for UNIFIED architecture
    const payload = {
      ...itineraryData,
      origin_id: tourId,
      type: 'tour'
    };

    console.log('🚀 CreateTourItinerary UNIFIED - Sending data:', {
      tourId,
      originalData: itineraryData,
      finalPayload: payload,
      endpoint: '/itineraries'
    });

    const response = await apiClient.post('/itineraries', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Create Tour Itinerary Error:', error);
    console.error('❌ Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      tourId,
      itineraryData
    });
    throw handleApiError(error, 'Failed to create tour itinerary');
  }
};

export const getTourItineraries = async (tourId) => {
  try {
    // UNIFIED ARCHITECTURE: Use query parameters
    const response = await apiClient.get(`/itineraries?origin_id=${tourId}&type=tour`);
    return response.data;
  } catch (error) {
    console.error('❌ Get Tour Itineraries Error:', error);
    throw handleApiError(error, 'Failed to fetch tour itineraries');
  }
};

export const updateTourItinerary = async (itineraryId, updateData) => {
  try {
    // UNIFIED ARCHITECTURE: Use /itineraries/{id} endpoint
    const response = await apiClient.put(`/itineraries/${itineraryId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('❌ Update Tour Itinerary Error:', error);
    throw handleApiError(error, 'Failed to update tour itinerary');
  }
};

export const deleteTourItinerary = async (itineraryId) => {
  try {
    // UNIFIED ARCHITECTURE: Use /itineraries/{id} endpoint
    const response = await apiClient.delete(`/itineraries/${itineraryId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete Tour Itinerary Error:', error);
    throw handleApiError(error, 'Failed to delete tour itinerary');
  }
};

// 🚀 Main Export
export default {
  // AI Itinerary APIs
  generateAIItinerary,
  getUserItineraries,
  getItineraryById,
  getCustomizableItinerary,
  updateCustomizedItinerary,
  deleteItinerary,

  // Tour Itinerary APIs
  createTourItinerary,
  getTourItineraries,
  updateTourItinerary,
  deleteTourItinerary,

  // Legacy APIs (marked for deprecation)
  getUserRequests,
  updateItineraryDay,
  updateActivity,
  addActivityToDay,
  deleteActivity,
  reorderActivities,

  // Utility
  getDestinations,
  handleApiError,
  PREFERENCE_OPTIONS,
  BUDGET_OPTIONS
};
