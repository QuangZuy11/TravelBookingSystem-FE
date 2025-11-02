/**
 * 🤖 AI ITINERARY SERVICE - Updated Architecture Integration
 * 
 * ✅ NEW DUAL-VIEW ARCHITECTURE 
 * Base URL: /api/ai-itineraries (unified endpoint structure)
 * 
 * �️ Architecture Features:
 * ✅ Dual Data Sources: AI Original (read-only) + User Customized (editable)
 * ✅ Individual Day Records: Each day = separate database record  
 * ✅ On-Demand Customization: Copy created only when user customizes
 * ✅ Data Preservation: AI original never modified → Can revert anytime
 * ✅ Origin ID System: aiGeneratedId for all operations
 * 
 * 🔄 New Flow:
 * Generate AI → View Original → Initialize Customize → Edit Customized
 * 
 * 📱 Frontend Benefits:
 * - Dual view toggle (Original vs Customized)
 * - Data preservation and revert capability  
 * - Clear edit/view mode separation
 * - Enhanced activity types (includes 'history', 'leisure')
 * 
 * Last Updated: 2025-11-01
 * Backend Status: ✅ 100% Working - Unified API Integration Complete!
 */

import apiClient from '../config/apiClient';

// ========================================
// 🤖 PART 1: AI GENERATION SYSTEM
// ========================================

/**
 * 1. Generate Direct Itinerary
 * POST /api/ai-itineraries/generate
 * ⚠️ NO JWT REQUIRED - Just user_id in body
 */
export const generateAIItinerary = async (formData, userId) => {
    try {
        console.log('🚀 Generating AI Itinerary...', { formData, userId });

        const requestBody = {
            destination: formData.destination,
            duration: formData.duration || formData.duration_days,
            travel_style: formData.travel_style || formData.budget_level || 'culture',
            budget: formData.budget || 1000,
            user_id: userId // ⚠️ Required field!
        };

        console.log('📤 Request body:', requestBody);

        const response = await apiClient.post('/ai-itineraries/generate', requestBody, {
            timeout: 60000, // 60 seconds for AI processing
            headers: {
                'Content-Type': 'application/json'
                // ⚠️ NO Authorization header needed for generation
            }
        });

        console.log('✅ Generation successful:', response.data);

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data,
                // ✅ NEW ARCHITECTURE: Store aiGeneratedId for all operations
                aiGeneratedId: response.data.data.aiGeneratedId,
                requestId: response.data.data.requestId
            };
        }

        throw new Error(response.data?.error?.message || 'Generation failed');
    } catch (error) {
        console.error('❌ AI Generation Error:', error);

        if (error.response?.status === 400) {
            throw new Error(`Validation Error: ${error.response.data?.error?.message || 'Invalid input data'}`);
        }

        if (error.response?.status === 500 && error.response.data?.error?.code === 'AI_SERVICE_ERROR') {
            throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
        }

        throw new Error(error.response?.data?.error?.message || error.message || 'Failed to generate itinerary');
    }
};

/**
 * 2. Generate from Stored Request
 * POST /api/ai-itineraries/generate/:requestId
 */
export const generateFromRequest = async (requestId) => {
    try {
        console.log('🔄 Regenerating from request:', requestId);

        const response = await apiClient.post(`/ai-itineraries/generate/${requestId}`, {}, {
            timeout: 60000
        });

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data,
                aiItineraryId: response.data.data.generated_id
            };
        }

        throw new Error(response.data?.error?.message || 'Regeneration failed');
    } catch (error) {
        console.error('❌ Regeneration Error:', error);
        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 3. Get All User Itineraries
 * GET /api/ai-itineraries/user/:userId
 */
export const getUserAIItineraries = async (userId) => {
    try {
        console.log('📋 Fetching user itineraries for:', userId);

        const response = await apiClient.get(`/ai-itineraries/user/${userId}`);

        return {
            success: true,
            data: response.data?.data || response.data || []
        };
    } catch (error) {
        console.error('❌ Get User Itineraries Error:', error);
        throw new Error(error.response?.data?.error?.message || 'Failed to fetch itineraries');
    }
};

// ⚠️ REMOVED: getAIItineraryById - use getOriginalItinerary instead

/**
 * 5. Delete AI Itinerary
 * DELETE /api/ai-itineraries/:id
 */
export const deleteAIItinerary = async (itineraryId) => {
    try {
        console.log('🗑️ Deleting AI itinerary:', itineraryId);

        const response = await apiClient.delete(`/ai-itineraries/${itineraryId}`);

        return {
            success: true,
            message: 'Itinerary deleted successfully'
        };
    } catch (error) {
        console.error('❌ Delete Itinerary Error:', error);
        throw new Error(error.response?.data?.error?.message || 'Failed to delete itinerary');
    }
};

// ========================================
// ✏️ PART 2: AI CUSTOMIZE SYSTEM
// ========================================

/**
 * Get JWT Token for Customize Operations
 */
const getAuthToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Authentication required. Please login first.');
    }
    return token;
};

// ========================================
// 📄 PART 2: DUAL-VIEW ARCHITECTURE APIs  
// ========================================

/**
 * 1. View Original AI Itinerary (Read-Only)
 * GET /api/ai-itineraries/{aiGeneratedId}/original
 * ✅ NEW ARCHITECTURE - Read-only original data
 * ⚠️ JWT REQUIRED - User must have access
 */
export const getOriginalItinerary = async (aiGeneratedId) => {
    try {
        console.log('📋 Getting original AI itinerary:', aiGeneratedId);

        const token = getAuthToken();

        const response = await apiClient.get(`/ai-itineraries/${aiGeneratedId}/original`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data?.success) {
            return {
                success: true,
                data: {
                    ...response.data.data,
                    isOriginal: true,
                    isCustomizable: false
                }
            };
        }

        throw new Error(response.data?.error?.message || 'Failed to get original itinerary');
    } catch (error) {
        console.error('❌ Get Original Itinerary Error:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please login first.');
        }

        if (error.response?.status === 404) {
            throw new Error('Original itinerary not found');
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 2. Initialize Customization 
 * POST /api/ai-itineraries/{aiGeneratedId}/initialize-customize
 * ✅ NEW ARCHITECTURE - Create customizable copy
 * ⚠️ JWT REQUIRED - User must own itinerary
 */
export const initializeCustomization = async (aiGeneratedId) => {
    try {
        console.log('⚙️ Initializing customization for:', aiGeneratedId);

        const token = getAuthToken();

        const response = await apiClient.post(`/ai-itineraries/${aiGeneratedId}/initialize-customize`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data,
                message: 'Customization initialized successfully'
            };
        }

        throw new Error(response.data?.error?.message || 'Failed to initialize customization');
    } catch (error) {
        console.error('❌ Initialize Customization Error:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please login first.');
        }

        if (error.response?.status === 409) {
            // Already exists - not an error
            console.log('ℹ️ Customization already exists');
            return { success: true, message: 'Customization already exists' };
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 3. Get Customizable Itinerary (Editable)
 * GET /api/ai-itineraries/{aiGeneratedId}/customize  
 * ✅ NEW ARCHITECTURE - Get or create editable version
 * ⚠️ JWT REQUIRED - Auto-initializes if needed
 */
export const getCustomizableItinerary = async (aiGeneratedId) => {
    try {
        console.log('✏️ Getting customizable itinerary:', aiGeneratedId);

        const token = getAuthToken();

        try {
            // Try to get existing customizable version
            const response = await apiClient.get(`/ai-itineraries/${aiGeneratedId}/customize`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data?.success) {
                return {
                    success: true,
                    data: {
                        ...response.data.data,
                        isOriginal: false,
                        isCustomizable: true
                    }
                };
            }

            throw new Error(response.data?.error?.message || 'Failed to get customizable itinerary');

        } catch (getError) {
            if (getError.response?.status === 404) {
                // No customizable version exists - initialize first
                console.log('🔧 No customizable version found, initializing...');
                await initializeCustomization(aiGeneratedId);

                // Retry after initialization
                const retryResponse = await apiClient.get(`/ai-itineraries/${aiGeneratedId}/customize`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (retryResponse.data?.success) {
                    return {
                        success: true,
                        data: {
                            ...retryResponse.data.data,
                            isOriginal: false,
                            isCustomizable: true
                        }
                    };
                }

                throw new Error(retryResponse.data?.error?.message || 'Failed to get customizable itinerary after initialization');
            }

            // Re-throw other errors
            throw getError;
        }

    } catch (error) {
        console.error('❌ Get Customizable Itinerary Error:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please login first.');
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 4. Update Day Information
 * PUT /api/ai-itineraries/{aiGeneratedId}/days/{dayNumber}
 * ✅ NEW ARCHITECTURE - Update specific day
 * ⚠️ JWT REQUIRED - User must own itinerary
 */
export const updateDay = async (aiGeneratedId, dayNumber, updates) => {
    try {
        console.log('📝 Updating day:', { aiGeneratedId, dayNumber, updates });

        const token = getAuthToken();

        const response = await apiClient.put(`/ai-itineraries/${aiGeneratedId}/days/${dayNumber}`, updates, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data
            };
        }

        throw new Error(response.data?.error?.message || 'Day update failed');
    } catch (error) {
        console.error('❌ Update Day Error:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please login first.');
        }

        if (error.response?.status === 404) {
            throw new Error('Day not found or itinerary not accessible');
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 5. Legacy Update Entire Itinerary (for backward compatibility)
 * PUT /api/ai-itineraries/{aiGeneratedId}
 * ⚠️ DEPRECATED - Use updateDay instead
 */
export const updateCustomizableItinerary = async (aiGeneratedId, updateData) => {
    try {
        console.log('⚠️ Using deprecated updateCustomizableItinerary - consider using updateDay');
        console.log('💾 Updating itinerary:', aiGeneratedId, updateData);

        const token = getAuthToken();

        const response = await apiClient.put(`/ai-itineraries/${aiGeneratedId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data
            };
        }

        throw new Error(response.data?.error?.message || 'Update failed');
    } catch (error) {
        console.error('❌ Update Itinerary Error:', error);

        if (error.response?.status === 401) {
            if (error.response.data?.error?.code === 'UNAUTHORIZED_ACCESS') {
                throw new Error(`Access Denied: ${error.response.data.error.message}`);
            }
            throw new Error('Authentication required');
        }

        if (error.response?.status === 404) {
            if (error.response.data?.error?.code === 'ITINERARY_NOT_FOUND') {
                throw new Error(`Itinerary not found: ID ${aiItineraryId} doesn't exist or is not customizable.`);
            }
            throw new Error('Itinerary not found');
        }

        if (error.response?.status === 400) {
            const errorCode = error.response.data?.error?.code;
            switch (errorCode) {
                case 'MAX_DAYS_EXCEEDED':
                    throw new Error('Maximum 30 days allowed');
                case 'MAX_ACTIVITIES_EXCEEDED':
                    throw new Error('Maximum 20 activities per day allowed');
                case 'INVALID_TIME_FORMAT':
                    throw new Error('Time must be in HH:MM format (00:00-23:59)');
                case 'INVALID_COST_VALUE':
                    throw new Error('Cost must be 0 or positive number');
                default:
                    throw new Error(error.response.data?.error?.message || 'Invalid data provided');
            }
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 6. Add Activity to Day  
 * POST /api/ai-itineraries/{aiGeneratedId}/days/{dayNumber}/activities
 * ✅ NEW ARCHITECTURE - Add activity to specific day
 * ⚠️ JWT REQUIRED - User must own itinerary
 */
export const addActivityToDay = async (aiGeneratedId, dayNumber, activityData) => {
    try {
        console.log('➕ Adding activity to day:', { aiGeneratedId, dayNumber, activityData });

        const token = getAuthToken();

        // Validate activity data format according to new architecture
        const validatedActivity = {
            name: activityData.name || activityData.activity,
            description: activityData.description || '',
            location: activityData.location || '',
            duration: parseInt(activityData.duration) || 60, // minutes
            cost: parseInt(activityData.cost) || 0,
            type: activityData.type || 'other',
            timeSlot: activityData.timeSlot || 'morning' // NEW: morning/afternoon/evening/night
        };

        const response = await apiClient.post(
            `/ai-itineraries/${aiGeneratedId}/days/${dayNumber}/activities`,
            validatedActivity,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data
            };
        }

        throw new Error(response.data?.error?.message || 'Failed to add activity');
    } catch (error) {
        console.error('❌ Add Activity Error:', error);

        if (error.response?.status === 400) {
            const errorCode = error.response.data?.error?.code;
            switch (errorCode) {
                case 'INVALID_DAY_NUMBER':
                    throw new Error(`Invalid day number: ${dayNumber}. Must be within itinerary range.`);
                case 'MAX_ACTIVITIES_EXCEEDED':
                    throw new Error('Maximum 20 activities per day allowed');
                case 'INVALID_TIME_FORMAT':
                    throw new Error('Time must be in HH:MM format');
                default:
                    throw new Error(error.response.data?.error?.message || 'Invalid activity data');
            }
        }

        if (error.response?.status === 404) {
            throw new Error(`Day ${dayNumber} not found in itinerary`);
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 7. Update Specific Activity
 * PUT /api/ai-itineraries/{aiGeneratedId}/days/{dayNumber}/activities/{activityId}
 * ✅ NEW ARCHITECTURE - Update specific activity
 * ⚠️ JWT REQUIRED - User must own itinerary  
 */
export const updateActivity = async (aiGeneratedId, dayNumber, activityId, updates) => {
    try {
        console.log('✏️ Updating activity:', { aiGeneratedId, dayNumber, activityId, updates });

        const token = getAuthToken();

        const response = await apiClient.put(`/ai-itineraries/${aiGeneratedId}/days/${dayNumber}/activities/${activityId}`, updates, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data
            };
        }

        throw new Error(response.data?.error?.message || 'Activity update failed');
    } catch (error) {
        console.error('❌ Update Activity Error:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please login first.');
        }

        if (error.response?.status === 404) {
            throw new Error('Activity not found');
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 8. Delete Activity
 * DELETE /api/ai-itineraries/{aiGeneratedId}/days/{dayNumber}/activities/{activityId}  
 * ✅ NEW ARCHITECTURE - Delete specific activity
 * ⚠️ JWT REQUIRED - User must own itinerary
 */
export const deleteActivity = async (aiGeneratedId, dayNumber, activityId) => {
    try {
        console.log('🗑️ Deleting activity:', { aiGeneratedId, dayNumber, activityId });

        const token = getAuthToken();

        const response = await apiClient.delete(`/ai-itineraries/${aiGeneratedId}/days/${dayNumber}/activities/${activityId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data?.success) {
            return {
                success: true,
                message: 'Activity deleted successfully'
            };
        }

        throw new Error(response.data?.error?.message || 'Failed to delete activity');
    } catch (error) {
        console.error('❌ Delete Activity Error:', error);

        if (error.response?.status === 404) {
            if (error.response.data?.error?.code === 'ACTIVITY_NOT_FOUND') {
                throw new Error(`Activity not found: ${activityId} may have been deleted already.`);
            }
            throw new Error('Activity not found');
        }

        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 9. Reorder Activities  
 * PUT /api/ai-itineraries/{aiGeneratedId}/days/{dayNumber}/reorder
 * ✅ NEW ARCHITECTURE - Reorder activities within day
 * ⚠️ JWT REQUIRED - User must own itinerary
 */
export const reorderActivities = async (aiGeneratedId, dayNumber, activityIds) => {
    try {
        console.log('🔄 Reordering activities:', { aiGeneratedId, dayNumber, activityIds });

        const token = getAuthToken();

        const response = await apiClient.put(
            `/ai-itineraries/${aiGeneratedId}/days/${dayNumber}/reorder`,
            { activity_ids: activityIds },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data
            };
        }

        throw new Error(response.data?.error?.message || 'Failed to reorder activities');
    } catch (error) {
        console.error('❌ Reorder Activities Error:', error);
        throw new Error(error.response?.data?.error?.message || error.message);
    }
};

/**
 * 6. Get Activity Types
 * GET /activity-types
 */
export const getActivityTypes = async () => {
    try {
        console.log('📋 Fetching activity types...');

        const response = await apiClient.get('/ai-itineraries/activity-types');

        if (response.data?.success) {
            return {
                success: true,
                data: response.data.data
            };
        }

        // Fallback to hardcoded types if API fails
        console.warn('⚠️ Using fallback activity types');
        return {
            success: true,
            data: {
                activity_types: ACTIVITY_TYPES,
                tip_categories: TIP_CATEGORIES
            }
        };
    } catch (error) {
        console.error('❌ Get Activity Types Error:', error);

        // Return fallback data
        return {
            success: true,
            data: {
                activity_types: ACTIVITY_TYPES,
                tip_categories: TIP_CATEGORIES
            }
        };
    }
};

// ========================================
// 📊 CONSTANTS & VALIDATION
// ========================================

/**
 * Activity Types - As per backend documentation
 */
export const ACTIVITY_TYPES = [
    'food',
    'transport',
    'sightseeing',
    'entertainment',
    'accommodation',
    'shopping',
    'nature',
    'culture',
    'adventure',
    'relaxation',
    'history',        // ✅ Added history type 
    'leisure',        // ✅ NEW - Added leisure type per new architecture
    'other'
];

/**
 * Time Slots for Activities (NEW ARCHITECTURE)
 */
export const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'night'];

/**
 * Travel Tip Categories
 */
export const TIP_CATEGORIES = [
    'weather',
    'transport',
    'culture',
    'food',
    'safety',
    'budget',
    'other'
];

/**
 * Travel Style Options
 */
export const TRAVEL_STYLES = [
    { value: 'adventure', label: 'Adventure', icon: '🧗' },
    { value: 'culture', label: 'Culture', icon: '🏛️' },
    { value: 'relaxation', label: 'Relaxation', icon: '🧘' },
    { value: 'budget', label: 'Budget', icon: '💰' },
    { value: 'luxury', label: 'Luxury', icon: '💎' }
];

/**
 * Activity Type Icons
 */
export const ACTIVITY_ICONS = {
    food: "🍽️",
    transport: "🚗",
    sightseeing: "🏛️",
    entertainment: "🎭",
    accommodation: "🏨",
    shopping: "🛍️",
    nature: "🌳",
    culture: "🏮",
    adventure: "⛰️",
    relaxation: "🧘",
    history: "🏺",      // ✅ Added history icon
    leisure: "🏖️",      // ✅ NEW - Added leisure icon per new architecture
    other: "📍"
};

// ========================================
// 🔧 VALIDATION FUNCTIONS
// ========================================

/**
 * Validate activity data
 */
export const validateActivity = (activity) => {
    const errors = [];

    if (!activity.activity || activity.activity.trim() === '') {
        errors.push('Activity name is required');
    }

    if (!activity.time || !activity.time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        errors.push('Valid time is required (HH:MM format)');
    }

    if (activity.cost < 0) {
        errors.push('Cost cannot be negative');
    }

    if (!ACTIVITY_TYPES.includes(activity.type)) {
        errors.push('Invalid activity type');
    }

    return errors;
};

/**
 * Validate generation request
 */
export const validateGenerationRequest = (request) => {
    const errors = [];

    if (!request.destination || request.destination.trim() === '') {
        errors.push('Destination is required');
    }

    if (!request.duration || request.duration < 1 || request.duration > 30) {
        errors.push('Duration must be between 1 and 30 days');
    }

    if (request.budget && request.budget <= 0) {
        errors.push('Budget must be greater than 0');
    }

    if (!request.user_id) {
        errors.push('User ID is required');
    }

    return errors;
};

/**
 * Format cost to VND
 */
export const formatVND = (amount) => {
    try {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    } catch (error) {
        return `${(amount || 0).toLocaleString()} VND`;
    }
};

/**
 * Calculate itinerary totals
 */
export const calculateTotals = (itineraryData) => {
    if (!Array.isArray(itineraryData)) return { totalDays: 0, totalActivities: 0, totalCost: 0 };

    let totalCost = 0;
    let totalActivities = 0;
    const totalDays = itineraryData.length;

    itineraryData.forEach(day => {
        if (day.activities && Array.isArray(day.activities)) {
            totalActivities += day.activities.length;
            totalCost += day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
        }
    });

    return {
        totalDays,
        totalActivities,
        totalCost
    };
};

/**
 * Create default activity
 */
export const createDefaultActivity = () => ({
    time: '09:00',
    duration: '1 hour',
    activity: '',
    location: '',
    cost: 0,
    type: 'other',
    description: '',
    notes: ''
});

/**
 * Create default day structure
 */
export const createDefaultDay = (dayNumber) => ({
    day: dayNumber,
    theme: `Day ${dayNumber}`,
    custom_theme: '',
    activities: [],
    day_total: 0,
    user_modified: false
});

// ========================================
// � VERSION CONFLICT HANDLER
// ========================================

/**
 * Handle API calls with automatic retry on version conflicts
 * ✅ NEW - According to frontend integration guide
 */
export const handleAPICall = async (apiCall, maxRetries = 3) => {
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const result = await apiCall();
            return result;
        } catch (error) {
            if (error.response?.status === 409) {
                // Version conflict - backend will retry automatically
                attempt++;
                console.log(`⚠️ Version conflict detected (attempt ${attempt}/${maxRetries}), retrying...`);

                if (attempt >= maxRetries) {
                    throw new Error('Version conflict - maximum retries exceeded');
                }

                // Small delay before retry
                await new Promise(resolve => setTimeout(resolve, 100 * attempt));
                continue;
            }

            // Re-throw other errors immediately
            throw error;
        }
    }
};

// ========================================
// �🚀 EXPORT DEFAULT
// ========================================

export default {
    // ✅ AI Generation  
    generateAIItinerary,
    generateFromRequest,
    getUserAIItineraries,
    deleteAIItinerary,

    // ✅ NEW ARCHITECTURE - Dual View APIs
    getOriginalItinerary,           // View read-only AI original
    initializeCustomization,        // Create customizable copy
    getCustomizableItinerary,       // Get editable version

    // ✅ CRUD Operations 
    updateDay,                      // Update day information
    addActivityToDay,               // Add activity to day
    updateActivity,                 // Update specific activity  
    deleteActivity,                 // Delete activity
    reorderActivities,              // Reorder activities
    getActivityTypes,               // Get activity types

    // ✅ BACKWARD COMPATIBILITY
    updateCustomizableItinerary,    // Legacy full update

    // Utils
    validateActivity,
    validateGenerationRequest,
    formatVND,
    calculateTotals,
    createDefaultActivity,
    createDefaultDay,

    // ✅ NEW - Version conflict handler
    handleAPICall,

    // ✅ Constants (Updated)
    ACTIVITY_TYPES,    // Now includes 'history' + 'leisure'
    TIME_SLOTS,        // NEW: morning/afternoon/evening/night
    TIP_CATEGORIES,
    TRAVEL_STYLES,
    ACTIVITY_ICONS     // Updated with history + leisure icons
};

// ========================================
// 🔄 BACKWARD COMPATIBILITY ALIASES
// ========================================

/**
 * Backward compatibility aliases for migration ease
 * These will be deprecated in future versions
 */

// Alias: getEditableItinerary → getCustomizableItinerary 
export const getEditableItinerary = getCustomizableItinerary;

// Alias: getAIItineraryById → getOriginalItinerary
export const getAIItineraryById = getOriginalItinerary;