import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedProviderRoute - Route protection for service providers
 * 
 * Checks if:
 * 1. User is logged in
 * 2. User is a service provider (role)
 * 3. Provider has completed registration (has type and licenses)
 * 
 * If not registered -> redirect to registration page
 */
const ProtectedProviderRoute = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        // Wait for auth to finish loading before checking
        if (!authLoading) {
            checkProviderRegistration();
        }
    }, [user, authLoading]);

    const checkProviderRegistration = () => {
        // Skip check if on registration page
        if (location.pathname === '/register/service-provider') {
            setIsChecking(false);
            return;
        }

        // Check localStorage for provider data
        const providerStr = localStorage.getItem('provider');
        let provider = null;

        try {
            provider = providerStr ? JSON.parse(providerStr) : null;
        } catch (error) {
            console.error('Error parsing provider from localStorage:', error);
        }

        // Also check from user object
        if (!provider && user?.provider) {
            provider = user.provider;
        }

        // Check if provider has completed registration
        // Provider must exist and have both type array and licenses array with at least 1 item
        const hasType = provider &&
            Array.isArray(provider.type) &&
            provider.type.length > 0;
        const hasLicenses = provider &&
            Array.isArray(provider.licenses) &&
            provider.licenses.length > 0;

        if (!hasType || !hasLicenses) {
            // Registration incomplete -> redirect to registration
            console.log('Provider registration incomplete:', {
                provider,
                hasType,
                hasLicenses,
                typeValue: provider?.type,
                licensesValue: provider?.licenses
            });
            setShouldRedirect(true);
        } else {
            // Registration complete -> allow access even if not verified by admin
            // Provider will see pending verification message in their dashboard
            console.log('Provider registration complete', {
                admin_verified: provider?.admin_verified,
                is_verified: provider?.is_verified
            });
        }

        setIsChecking(false);
    };

    // Still loading auth from localStorage
    if (authLoading || isChecking) {
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
                    <p style={{ color: '#6b7280', margin: 0 }}>Đang kiểm tra thông tin...</p>
                </div>
            </div>
        );
    }

    // Not logged in -> redirect to login
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Not a provider -> redirect to home
    if (user.role !== 'ServiceProvider' && user.role !== 'Provider') {
        return <Navigate to="/" replace />;
    }

    // Need to complete registration -> redirect
    if (shouldRedirect) {
        // Redirect to registration page if registration incomplete
        return <Navigate to="/register/service-provider" state={{ from: location }} replace />;
    }

    // All checks passed -> render children
    return children;
};

export default ProtectedProviderRoute;
