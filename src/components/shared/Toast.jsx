import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const exitTimer = setTimeout(() => {
                setIsExiting(true);
            }, duration - 300);

            const closeTimer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);

            return () => {
                clearTimeout(exitTimer);
                clearTimeout(closeTimer);
            };
        }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const getTypeStyles = () => {
        const types = {
            success: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                icon: '✓',
                iconBg: '#059669'
            },
            error: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                icon: '✕',
                iconBg: '#dc2626'
            },
            warning: {
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                icon: '⚠',
                iconBg: '#d97706'
            },
            info: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                icon: 'ℹ',
                iconBg: '#2563eb'
            }
        };

        return types[type] || types.info;
    };

    const typeStyles = getTypeStyles();

    const toastStyle = {
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        minWidth: '300px',
        maxWidth: '500px',
        background: typeStyles.background,
        color: 'white',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 9999,
        animation: isExiting 
            ? 'slideOut 0.3s ease forwards'
            : 'slideIn 0.3s ease forwards',
        fontFamily: 'inherit'
    };

    const iconStyle = {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: typeStyles.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        fontWeight: '700',
        flexShrink: 0
    };

    const contentStyle = {
        flex: 1,
        fontSize: '0.875rem',
        lineHeight: '1.5',
        fontWeight: '500'
    };

    const closeButtonStyle = {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        flexShrink: 0
    };

    return (
        <>
            <style>
                {`
                    @keyframes slideIn {
                        from {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }

                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                    }
                `}
            </style>
            <div style={toastStyle}>
                <div style={iconStyle}>{typeStyles.icon}</div>
                <div style={contentStyle}>{message}</div>
                <button
                    onClick={() => {
                        setIsExiting(true);
                        setTimeout(() => {
                            setIsVisible(false);
                            onClose?.();
                        }, 300);
                    }}
                    style={closeButtonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                    ✕
                </button>
            </div>
        </>
    );
};

export default Toast;