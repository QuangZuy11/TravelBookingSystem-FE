import axios from 'axios';
import { clearAuthData } from '../utils/authHelpers';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        // Try different token keys for compatibility
        const token = localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Adding token to request:', config.url, 'Token present:', !!token);
        } else {
            console.warn('⚠️ No auth token found for request:', config.url);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Log the API endpoint that caused 401
            console.warn('🚨 401 Unauthorized for:', originalRequest.url);

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    console.warn('⚠️ No refresh token available, but not auto-logging out for customize APIs');

                    // Don't auto-logout for customize/itinerary APIs - just return the error
                    if (originalRequest.url?.includes('/ai-itinerary/')) {
                        console.log('🛡️ Preserving auth session for itinerary API');
                        return Promise.reject(error);
                    }

                    throw new Error('No refresh token available');
                }

                // Attempt to refresh token
                const response = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('🔄 Token refresh failed:', refreshError);

                // Don't auto-logout for customize/itinerary APIs - preserve user session
                if (originalRequest.url?.includes('/ai-itinerary/')) {
                    console.log('🛡️ Preserving user session despite token issues for itinerary API');
                    return Promise.reject(error);
                }

                // Only clear auth and redirect for critical auth endpoints
                console.log('🚪 Auto-logout triggered for critical auth failure');
                clearAuthData();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;