/**
 * Token Management Utilities
 * Handles storage, retrieval, and validation of authentication tokens
 */

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user'
};

/**
 * Store access token in localStorage
 * @param {string} token - JWT access token
 */
export const setAccessToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
    }
};

/**
 * Get access token from localStorage
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
    // Support both 'accessToken' and 'token' keys for backward compatibility
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || localStorage.getItem('token');
};

/**
 * Store refresh token in localStorage
 * @param {string} token - JWT refresh token
 */
export const setRefreshToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
    }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} Refresh token or null
 */
export const getRefreshToken = () => {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Store user data in localStorage
 * @param {object} user - User object
 */
export const setUser = (user) => {
    if (user) {
        localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    }
};

/**
 * Get user data from localStorage
 * @returns {object|null} User object or null
 */
export const getUser = () => {
    const user = localStorage.getItem(TOKEN_KEYS.USER);
    return user ? JSON.parse(user) : null;
};

/**
 * Store authentication data (tokens and user)
 * @param {object} authData - Object containing accessToken, refreshToken, and user
 */
export const setAuthData = ({ accessToken, refreshToken, user }) => {
    if (accessToken) setAccessToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
    if (user) setUser(user);
};

/**
 * Get all authentication data
 * @returns {object} Object containing accessToken, refreshToken, and user
 */
export const getAuthData = () => {
    return {
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        user: getUser()
    };
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER);
};

/**
 * Check if user is authenticated (has valid access token)
 * @returns {boolean} True if user has access token
 */
export const isAuthenticated = () => {
    const token = getAccessToken();
    return !!token;
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null
 */
export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // Check if token expiration time has passed
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
export const getTokenExpiration = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
};

/**
 * Get time until token expires (in seconds)
 * @param {string} token - JWT token
 * @returns {number} Seconds until expiration or 0 if expired
 */
export const getTimeUntilExpiration = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Date.now() / 1000;
    const timeLeft = decoded.exp - currentTime;
    
    return timeLeft > 0 ? timeLeft : 0;
};

/**
 * Get user role from token
 * @param {string} token - JWT token
 * @returns {string|null} User role or null
 */
export const getUserRole = (token) => {
    const decoded = decodeToken(token);
    // Support both flat and nested structure
    const role = decoded?.role || decoded?.user?.role || null;
    
    // Normalize role names to match frontend expectations
    const roleMap = {
        'ServiceProvider': 'PROVIDER',
        'Traveler': 'TRAVELER',
        'Admin': 'ADMIN'
    };
    
    return role ? (roleMap[role] || role) : null;
};

/**
 * Get provider ID from token
 * @param {string} token - JWT token
 * @returns {string|null} Provider ID or null
 */
export const getProviderId = (token) => {
    const decoded = decodeToken(token);
    // Support both flat and nested structure
    return decoded?.providerId || decoded?.user?.id || null;
};

export default {
    setAccessToken,
    getAccessToken,
    setRefreshToken,
    getRefreshToken,
    setUser,
    getUser,
    setAuthData,
    getAuthData,
    clearAuthData,
    isAuthenticated,
    decodeToken,
    isTokenExpired,
    getTokenExpiration,
    getTimeUntilExpiration,
    getUserRole,
    getProviderId
};