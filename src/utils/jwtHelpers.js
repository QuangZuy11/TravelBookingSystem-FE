// JWT Token Analysis Helper
export const analyzeJWTToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    if (!token) {
        return { error: 'No token found' };
    }

    try {
        // JWT tokens have 3 parts: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { error: 'Invalid token format' };
        }

        // Decode payload (middle part)
        const payload = JSON.parse(atob(parts[1]));

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < now;

        return {
            payload,
            isExpired,
            userId: payload.user?.id,
            userRole: payload.user?.role,
            issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
            expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
            timeUntilExpiry: payload.exp ? (payload.exp - now) : null
        };
    } catch (error) {
        return { error: 'Failed to decode token', details: error.message };
    }
};

// Check if user can edit specific itinerary
export const checkItineraryPermissions = async (itineraryId) => {
    const tokenInfo = analyzeJWTToken();

    if (tokenInfo.error) {
        return { canEdit: false, reason: tokenInfo.error };
    }

    if (tokenInfo.isExpired) {
        return { canEdit: false, reason: 'Token expired' };
    }

    // Additional checks based on user role and itinerary ownership
    console.log('🔍 Permission check:', {
        userId: tokenInfo.userId,
        userRole: tokenInfo.userRole,
        itineraryId,
        tokenExpiry: tokenInfo.expiresAt
    });

    return {
        canEdit: true, // Will be determined by backend
        userId: tokenInfo.userId,
        userRole: tokenInfo.userRole,
        tokenInfo
    };
};