import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    };

    const contentStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '4rem 3rem',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    };

    const errorCodeStyle = {
        fontSize: '8rem',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1rem',
        lineHeight: '1'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1rem'
    };

    const messageStyle = {
        fontSize: '1.125rem',
        color: '#6b7280',
        lineHeight: '1.6',
        marginBottom: '2rem'
    };

    const actionsStyle = {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
    };

    const buttonBaseStyle = {
        padding: '0.875rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const primaryButtonStyle = {
        ...buttonBaseStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    const secondaryButtonStyle = {
        ...buttonBaseStyle,
        background: 'white',
        color: '#6b7280',
        border: '2px solid #e5e7eb'
    };

    const illustrationStyle = {
        fontSize: '6rem',
        marginBottom: '2rem',
        animation: 'shake 0.5s ease-in-out'
    };

    return (
        <>
            <style>
                {`
                    @keyframes shake {
                        0%, 100% {
                            transform: translateX(0);
                        }
                        25% {
                            transform: translateX(-10px);
                        }
                        75% {
                            transform: translateX(10px);
                        }
                    }
                `}
            </style>
            <div style={containerStyle}>
                <div style={contentStyle}>
                    <div style={illustrationStyle}>🔒</div>
                    <div style={errorCodeStyle}>403</div>
                    <h1 style={titleStyle}>Access Denied</h1>
                    <p style={messageStyle}>
                        Sorry, you don't have permission to access this page. 
                        Please contact your administrator if you believe this is an error.
                    </p>
                    
                    <div style={actionsStyle}>
                        <button
                            onClick={() => navigate(-1)}
                            style={secondaryButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            ← Go Back
                        </button>
                        
                        <button
                            onClick={() => navigate('/')}
                            style={primaryButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            🏠 Go to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UnauthorizedPage;