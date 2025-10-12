import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route Component
 * Protects routes from unauthorized access
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if user doesn't have required role
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const location = useLocation();
    const { user, loading } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e5e7eb',
                        borderTopColor: '#667eea',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Đang tải...</p>
                </div>
            </div>
        );
    }

    // Check authentication
    if (!user) {
        // Redirect to login with return URL
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Check role if required
    if (requiredRole) {
        const userRole = user.role;

        if (!userRole || userRole !== requiredRole) {
            // Redirect to unauthorized page
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // User is authenticated and authorized
    return children;
};

export default ProtectedRoute;