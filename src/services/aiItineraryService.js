/**
 * AI Itinerary Service
 * Backend API: POST /api/ai-itineraries/generate
 * Spec: docs/Frontend_AI_Itinerary_Guide.md
 */

import apiClient from '../config/apiClient';

const AI_ITINERARY_BASE = '/ai-itineraries';

/**
 * Generate AI Itinerary
 * @param {Object} request - Itinerary generation request
 * @param {string} request.user_id - User's ObjectId (required)
 * @param {string} request.destination - Destination name (required, e.g. "Hanoi")
 * @param {number} request.duration_days - Number of days (required, 1-14)
 * @param {string} request.budget_level - Budget level: 'low' | 'medium' | 'high' (optional, default: 'medium')
 * @param {string[]} request.preferences - User preferences array (optional, e.g. ['culture', 'history', 'food'])
 * @returns {Promise} Response with itinerary_data array
 */
export const generateAIItinerary = async (request) => {
  try {
    const response = await apiClient.post(`${AI_ITINERARY_BASE}/generate`, request, {
      timeout: 60000 // 60 seconds as per spec
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
 * Get User's Itineraries
 * @param {string} userId - User's ObjectId
 * @returns {Promise} Response with user's requests and itineraries
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
 * Get Specific Itinerary
 * @param {string} itineraryId - Itinerary ObjectId
 * @returns {Promise} Response with itinerary details including POI details
 */
export const getItineraryById = async (itineraryId) => {
  try {
    const response = await apiClient.get(`${AI_ITINERARY_BASE}/${itineraryId}`);
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
 * Delete Itinerary
 * @param {string} itineraryId - Itinerary ObjectId
 * @returns {Promise} Response confirming deletion
 */
export const deleteItinerary = async (itineraryId) => {
  try {
    const response = await apiClient.delete(`${AI_ITINERARY_BASE}/${itineraryId}`);
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
 * Preference options for user selection
 */
export const PREFERENCE_OPTIONS = [
  { id: 'culture', label: 'Culture', icon: '🏛️' },
  { id: 'history', label: 'History', icon: '📜' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'adventure', label: 'Adventure', icon: '🧗' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { id: 'relaxation', label: 'Relaxation', icon: '🧘' }
];

/**
 * Budget level options
 */
export const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget', emoji: '🟢', description: 'Low cost activities' },
  { value: 'medium', label: 'Moderate', emoji: '🟡', description: 'Balanced experiences' },
  { value: 'high', label: 'Luxury', emoji: '🔵', description: 'Premium experiences' }
];

export default {
  generateAIItinerary,
  getUserItineraries,
  getItineraryById,
  getUserRequests,
  deleteItinerary,
  updateItineraryDay,
  updateActivity,
  addActivityToDay,
  deleteActivity,
  reorderActivities,
  getDestinations,
  PREFERENCE_OPTIONS,
  BUDGET_OPTIONS
};
