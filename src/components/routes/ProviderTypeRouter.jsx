import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProviderTypeRouter - Routes provider to appropriate dashboard based on their service type
 * 
 * Logic:
 * - All providers go to /provider/dashboard
 * - Dashboard will automatically show only sections for registered service types
 * - ServiceProviderDashboard uses provider.type.includes('hotel'|'tour') to conditionally render sections
 */
const ProviderTypeRouter = () => {
    const { user } = useAuth();
    const [targetRoute, setTargetRoute] = useState(null);

    useEffect(() => {
        determineTargetRoute();
    }, [user]);

    const determineTargetRoute = () => {
        // Get provider from localStorage or user object
        const providerStr = localStorage.getItem('provider');
        let provider = null;

        try {
            provider = providerStr ? JSON.parse(providerStr) : null;
        } catch (error) {
            console.error('Error parsing provider:', error);
        }

        if (!provider && user?.provider) {
            provider = user.provider;
        }

        // Safety check
        if (!provider || !Array.isArray(provider.type) || provider.type.length === 0) {
            console.error('Invalid provider type data');
            setTargetRoute('/');
            return;
        }

        // ALL providers go to the same dashboard
        // Dashboard will show only sections for their registered types
        setTargetRoute('/provider/dashboard');
    };

    // Loading state
    if (!targetRoute) {
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
                    <p style={{ color: '#6b7280', margin: 0 }}>Đang chuyển hướng...</p>
                </div>
            </div>
        );
    }

    // Redirect to target route
    return <Navigate to={targetRoute} replace />;
};

export default ProviderTypeRouter;
