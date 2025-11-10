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
        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Adding token to request:', config.url);
        } else {
            // Only log warning for endpoints that require auth
            if (!config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
                console.warn('⚠️ No auth token found for request:', config.url);
            }
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

                const { token, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                localStorage.setItem('token', token);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('🔄 Token refresh failed:', refreshError);

                // Check if token exists in localStorage before clearing
                const currentToken = localStorage.getItem('token');
                if (!currentToken) {
                    console.log('� No valid token found, redirecting to login');
                    clearAuthData();
                    window.location.href = '/auth';
                    return Promise.reject(error);
                }

                // If token exists but request still failed, just reject without clearing auth
                console.log('�️ Request failed but preserving valid token');
                return Promise.reject(error);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;