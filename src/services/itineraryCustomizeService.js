import apiClient from '../config/apiClient';
import { analyzeJWTToken, checkItineraryPermissions } from '../utils/jwtHelpers';

// Debug function to check auth status
const debugAuthStatus = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const user = localStorage.getItem('fullName');
    const jwtInfo = analyzeJWTToken();

    console.log('🔍 Auth Debug:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
        user: user || 'None',
        jwtInfo,
        allKeys: Object.keys(localStorage)
    });
    return !!token;
};

// Get editable itinerary data
export const getEditableItinerary = async (itineraryId) => {
    try {
        // Debug auth status before API call
        debugAuthStatus();

        const response = await apiClient.get(`/ai-itinerary/${itineraryId}/editable`);
        return response.data;
    } catch (error) {
        console.error('Error fetching editable itinerary:', error);

        // Handle 401 gracefully - don't let it bubble up and cause logout
        if (error.response?.status === 401) {
            console.warn('⚠️ 401 Authentication issue with customize API');
            console.log('Full error response:', error.response?.data);

            // Check if it's the specific UNAUTHORIZED_ACCESS error
            const errorData = error.response?.data;
            if (errorData?.error?.code === 'UNAUTHORIZED_ACCESS') {
                throw new Error(`Authentication Error: ${errorData.error.message || 'User authentication required'}`);
            }

            throw new Error('Authentication required for editing. Please check your login status.');
        }

        // Handle 404 - itinerary not found
        if (error.response?.status === 404) {
            throw new Error('Itinerary not found or you do not have permission to edit it.');
        }

        // Handle network errors
        if (!error.response) {
            throw new Error('Unable to connect to server. Please check your internet connection.');
        }

        throw error;
    }
};

// Update entire itinerary
export const updateItinerary = async (itineraryId, data) => {
    try {
        // Debug auth status before API call
        console.log('🔄 Attempting to update itinerary:', itineraryId);
        const hasAuth = debugAuthStatus();

        if (!hasAuth) {
            throw new Error('❌ No authentication token found. Please login first.');
        }

        // Pre-check permissions
        const permissionCheck = await checkItineraryPermissions(itineraryId);
        if (!permissionCheck.canEdit && permissionCheck.reason) {
            throw new Error(`Permission check failed: ${permissionCheck.reason}`);
        }

        console.log('🔑 Making authenticated request with user:', {
            userId: permissionCheck.userId,
            role: permissionCheck.userRole,
            itineraryId
        });

        const response = await apiClient.put(`/ai-itinerary/${itineraryId}`, data);
        console.log('✅ Update successful:', response.status);
        return response.data;
    } catch (error) {
        console.error('Error updating itinerary:', error);

        // Handle auth errors gracefully
        if (error.response?.status === 401) {
            console.warn('⚠️ 401 Authentication issue during update - preserving user session');
            console.log('Full error response:', error.response?.data);
            console.log('Request URL:', error.config?.url);
            console.log('Request headers:', error.config?.headers);
            debugAuthStatus();

            const errorData = error.response?.data;
            if (errorData?.error?.code === 'UNAUTHORIZED_ACCESS') {
                console.error('🚫 UNAUTHORIZED_ACCESS detected - analyzing permissions...');

                const jwtInfo = analyzeJWTToken();
                console.log('🔍 JWT Analysis:', jwtInfo);

                // Detailed permission analysis
                if (jwtInfo.error) {
                    throw new Error(`Token error: ${jwtInfo.error}. Please login again.`);
                }

                if (jwtInfo.isExpired) {
                    throw new Error(`Token expired at ${jwtInfo.expiresAt}. Please login again.`);
                }

                // Token is valid but access denied - likely ownership/permission issue
                if (jwtInfo.userRole === 'ServiceProvider') {
                    throw new Error(`Access denied: ServiceProvider accounts may not be able to edit traveler itineraries. Try with a Traveler account or check if this is your itinerary.`);
                } else if (jwtInfo.userRole === 'Traveler') {
                    throw new Error(`Access denied: You can only edit itineraries you created. This itinerary (ID: ${itineraryId}) may belong to another user.`);
                } else {
                    throw new Error(`Access denied: User role '${jwtInfo.userRole}' may not have permission to edit itineraries. ${errorData.error.message || ''}`);
                }
            }

            throw new Error('Authentication required for saving changes. Please refresh and try again.');
        }

        // Handle 404 - itinerary not found 
        if (error.response?.status === 404) {
            console.error('🔍 404 Not Found - Itinerary does not exist or is not customizable');
            console.log('Full error response:', error.response?.data);

            const errorData = error.response?.data;
            if (errorData?.error?.code === 'ITINERARY_NOT_FOUND') {
                throw new Error(`Itinerary not found: This itinerary (ID: ${itineraryId}) doesn't exist or is not available for customization. It may have been deleted or you may not have access to it.`);
            }

            throw new Error(`Itinerary not found (ID: ${itineraryId}). Please check the itinerary ID or go back to your itineraries list.`);
        }

        // Handle validation errors
        if (error.response?.status === 400) {
            throw new Error(error.response.data?.message || 'Invalid data provided. Please check your inputs.');
        }

        // Handle server errors
        if (error.response?.status >= 500) {
            throw new Error('Server error occurred. Please try again in a moment.');
        }

        throw error;
    }
};

// Add new activity to a specific day
export const addActivityToDay = async (itineraryId, dayNumber, activityData) => {
    try {
        const response = await apiClient.post(
            `/ai-itinerary/${itineraryId}/days/${dayNumber}/activities`,
            activityData
        );
        return response.data;
    } catch (error) {
        console.error('Error adding activity:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please refresh the page and try again.');
        }

        if (error.response?.status === 400) {
            throw new Error(error.response.data?.message || 'Invalid activity data provided.');
        }

        throw new Error('Failed to add activity. Please try again.');
    }
};

// Update specific activity
export const updateActivity = async (itineraryId, activityId, activityData) => {
    try {
        const response = await apiClient.put(
            `/ai-itinerary/${itineraryId}/activities/${activityId}`,
            activityData
        );
        return response.data;
    } catch (error) {
        console.error('Error updating activity:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please refresh the page and try again.');
        }

        if (error.response?.status === 404) {
            throw new Error('Activity not found. It may have been deleted by another user.');
        }

        throw new Error('Failed to update activity. Please try again.');
    }
};

// Delete activity
export const deleteActivity = async (itineraryId, activityId) => {
    try {
        const response = await apiClient.delete(`/ai-itinerary/${itineraryId}/activities/${activityId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting activity:', error);

        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please refresh the page and try again.');
        }

        if (error.response?.status === 404) {
            throw new Error('Activity not found. It may have already been deleted.');
        }

        throw new Error('Failed to delete activity. Please try again.');
    }
};

// Reorder activities in a day
export const reorderActivities = async (itineraryId, dayNumber, activityIds) => {
    try {
        const response = await apiClient.put(
            `/ai-itinerary/${itineraryId}/days/${dayNumber}/reorder`,
            { activity_ids: activityIds }
        );
        return response.data;
    } catch (error) {
        console.error('Error reordering activities:', error);
        throw error;
    }
};

// Add new day
export const addDay = async (itineraryId, dayData) => {
    try {
        const response = await apiClient.post(`/ai-itinerary/${itineraryId}/days`, dayData);
        return response.data;
    } catch (error) {
        console.error('Error adding day:', error);
        throw error;
    }
};

// Delete day
export const deleteDay = async (itineraryId, dayNumber) => {
    try {
        const response = await apiClient.delete(`/ai-itinerary/${itineraryId}/days/${dayNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting day:', error);
        throw error;
    }
};

// Update day theme
export const updateDayTheme = async (itineraryId, dayNumber, theme) => {
    try {
        const response = await apiClient.put(
            `/ai-itinerary/${itineraryId}/days/${dayNumber}`,
            { theme }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating day theme:', error);
        throw error;
    }
};

// Add travel tip
export const addTravelTip = async (itineraryId, tipData) => {
    try {
        const response = await apiClient.post(`/ai-itinerary/${itineraryId}/tips`, tipData);
        return response.data;
    } catch (error) {
        console.error('Error adding travel tip:', error);
        throw error;
    }
};

// Update travel tip
export const updateTravelTip = async (itineraryId, tipId, tipData) => {
    try {
        const response = await apiClient.put(`/ai-itinerary/${itineraryId}/tips/${tipId}`, tipData);
        return response.data;
    } catch (error) {
        console.error('Error updating travel tip:', error);
        throw error;
    }
};

// Delete travel tip
export const deleteTravelTip = async (itineraryId, tipId) => {
    try {
        const response = await apiClient.delete(`/ai-itinerary/${itineraryId}/tips/${tipId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting travel tip:', error);
        throw error;
    }
};

// Activity types for validation
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
    'other'
];

// Default activity data
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

// Default day data
export const createDefaultDay = (dayNumber) => ({
    day: dayNumber,
    theme: `Day ${dayNumber}`,
    activities: []
});

// Validation functions
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

export const validateDay = (day) => {
    const errors = [];

    if (!day.theme || day.theme.trim() === '') {
        errors.push('Day theme is required');
    }

    if (!day.day || day.day < 1 || day.day > 30) {
        errors.push('Day number must be between 1 and 30');
    }

    if (day.activities && day.activities.length > 20) {
        errors.push('Maximum 20 activities per day allowed');
    }

    return errors;
};

// Calculate totals
export const calculateItineraryTotals = (itineraryData) => {
    let totalCost = 0;
    let totalActivities = 0;
    let totalDays = itineraryData.length;

    itineraryData.forEach(day => {
        if (day.activities) {
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