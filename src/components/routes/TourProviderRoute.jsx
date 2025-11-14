import React from 'react';
import { Navigate } from 'react-router-dom';

const TourProviderRoute = ({ children }) => {
    const providerStr = localStorage.getItem('provider');

    if (!providerStr) {
        return <Navigate to="/provider" replace />;
    }

    try {
        const provider = JSON.parse(providerStr);
        const providerTypes = Array.isArray(provider.type) ? provider.type : [provider.type];

        // Check if provider has 'tour' type
        if (!providerTypes.includes('tour')) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '3rem',
                        maxWidth: '500px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🚫</div>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            marginBottom: '1rem'
                        }}>
                            Truy cập bị từ chối
                        </h2>
                        <p style={{
                            color: '#6b7280',
                            marginBottom: '2rem',
                            lineHeight: '1.6'
                        }}>
                            Tính năng <strong>AI Bookings</strong> chỉ dành cho <strong>Tour Service Providers</strong>.
                        </p>
                        <div style={{
                            background: '#fef3c7',
                            border: '1px solid #fbbf24',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '2rem',
                            fontSize: '0.875rem',
                            color: '#92400e'
                        }}>
                            <strong>Loại tài khoản của bạn:</strong> {providerTypes.join(', ')}
                        </div>
                        <button
                            onClick={() => window.location.href = '/provider'}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            ← Quay về Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return children;
    } catch (error) {
        console.error('Error parsing provider data:', error);
        return <Navigate to="/provider" replace />;
    }
};

export default TourProviderRoute;
