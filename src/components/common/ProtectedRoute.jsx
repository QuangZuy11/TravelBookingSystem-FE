import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, getAccessToken } from '../../utils/tokenUtils';

/**
 * Protected Route Component
 * Protects routes from unauthorized access
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if user doesn't have required role
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const location = useLocation();
    const authenticated = isAuthenticated();
    
    // Check authentication
    if (!authenticated) {
        // Redirect to login with return URL
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Check role if required
    if (requiredRole) {
        const token = getAccessToken();
        const userRole = getUserRole(token);

        if (!userRole || userRole !== requiredRole) {
            // Redirect to unauthorized page
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // User is authenticated and authorized
    return children;
};

export default ProtectedRoute;